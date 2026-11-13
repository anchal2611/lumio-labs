import { Server, Socket } from 'socket.io';
import { v4 as uuid } from 'uuid';
import db from '../db/database';

export const COLLAB_PALETTE = [
  { bg: '#3B82F6', text: '#FFFFFF', light: 'rgba(59, 130, 246, 0.18)', border: '#60A5FA' }, // Blue
  { bg: '#10B981', text: '#FFFFFF', light: 'rgba(16, 185, 129, 0.18)', border: '#34D399' }, // Emerald
  { bg: '#8B5CF6', text: '#FFFFFF', light: 'rgba(139, 92, 246, 0.18)', border: '#A78BFA' }, // Purple
  { bg: '#F59E0B', text: '#111827', light: 'rgba(245, 158, 11, 0.18)', border: '#FBBF24' }, // Amber
  { bg: '#EC4899', text: '#FFFFFF', light: 'rgba(236, 72, 153, 0.18)', border: '#F472B6' }, // Pink
  { bg: '#06B6D4', text: '#FFFFFF', light: 'rgba(6, 182, 212, 0.18)', border: '#22D3EE' },  // Cyan
  { bg: '#F97316', text: '#FFFFFF', light: 'rgba(249, 115, 22, 0.18)', border: '#FB923C' }, // Orange
  { bg: '#14B8A6', text: '#FFFFFF', light: 'rgba(20, 184, 166, 0.18)', border: '#2DD4BF' }, // Teal
  { bg: '#6366F1', text: '#FFFFFF', light: 'rgba(99, 102, 241, 0.18)', border: '#818CF8' }, // Indigo
  { bg: '#EF4444', text: '#FFFFFF', light: 'rgba(239, 68, 68, 0.18)', border: '#F87171' },  // Red
  { bg: '#84CC16', text: '#111827', light: 'rgba(132, 204, 22, 0.18)', border: '#A3E635' }, // Lime
  { bg: '#D946EF', text: '#FFFFFF', light: 'rgba(217, 70, 239, 0.18)', border: '#E879F9' }, // Fuchsia
];

export function getUserColor(userId: string): (typeof COLLAB_PALETTE)[0] {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash << 5) - hash + userId.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % COLLAB_PALETTE.length;
  return COLLAB_PALETTE[index];
}

export interface CollabUser {
  socketId: string;
  userId: string;
  userName: string;
  userRole: string;
  userColor: (typeof COLLAB_PALETTE)[0];
  canEdit?: boolean;
  cursor?: {
    lineNumber: number;
    column: number;
    selection?: {
      startLineNumber: number;
      startColumn: number;
      endLineNumber: number;
      endColumn: number;
    };
  };
  activeLockedLines: number[];
  lastActivity: number;
}

export interface LineLock {
  lineNumber: number;
  lineId: string;
  userId: string;
  userName: string;
  userColor: (typeof COLLAB_PALETTE)[0];
  socketId: string;
  lockedAt: number;
  lastActivity: number;
  expiresAt: number;
  graceExpiresAt?: number;
}

export interface DocumentChange {
  range: {
    startLineNumber: number;
    startColumn: number;
    endLineNumber: number;
    endColumn: number;
  };
  text: string;
  rangeLength?: number;
}

export interface RoomState {
  roomId: string;
  version: number;
  code: string;
  lines: string[];
  lineIds: string[];
  locks: Map<number, LineLock>; // keyed by 1-based lineNumber
  participants: Map<string, CollabUser>; // keyed by socketId
  lastSavedCode: string;
}

export const LOCK_INACTIVITY_MS = 15_000; // 15 seconds of inactivity before lock expires
export const LOCK_GRACE_PERIOD_MS = 3_000; // 3 seconds grace period after moving away

export class CollabManager {
  private rooms = new Map<string, RoomState>();
  private sweepInterval: NodeJS.Timeout | null = null;
  private io: Server | null = null;

  constructor() {
    // Start periodic inactivity sweeper
    this.sweepInterval = setInterval(() => this.sweepExpiredLocks(), 1000);
  }

  public setIo(io: Server) {
    this.io = io;
  }

  public destroy() {
    if (this.sweepInterval) {
      clearInterval(this.sweepInterval);
      this.sweepInterval = null;
    }
  }

  /**
   * Get or initialize a room state from DB / cache.
   */
  public getOrCreateRoom(roomId: string): RoomState {
    let room = this.rooms.get(roomId);
    if (!room) {
      const session = db.prepare('SELECT initial_code FROM collab_sessions WHERE id = ?').get(roomId) as any;
      const initialCode = typeof session?.initial_code === 'string' ? session.initial_code : '';
      const lines: string[] = initialCode.length > 0 ? initialCode.split('\n') : [''];
      const lineIds: string[] = lines.map((_: string, i: number) => `ln_${uuid().slice(0, 8)}_${i + 1}`);

      room = {
        roomId,
        version: 1,
        code: initialCode,
        lines,
        lineIds,
        locks: new Map(),
        participants: new Map(),
        lastSavedCode: initialCode,
      };
      this.rooms.set(roomId, room);
    }
    return room;
  }

  /**
   * Add a participant to a room.
   */
  public joinParticipant(
    roomId: string,
    socket: Socket,
    account: { id: string; name: string; role: string }
  ): { room: RoomState; user: CollabUser } {
    const room = this.getOrCreateRoom(roomId);
    const userColor = getUserColor(account.id);

    // Remove any previous socket for this user in this room to avoid duplicates
    for (const [sId, p] of room.participants.entries()) {
      if (p.userId === account.id && sId !== socket.id) {
        this.releaseAllUserLocks(room, p.userId);
        room.participants.delete(sId);
      }
    }

    const user: CollabUser = {
      socketId: socket.id,
      userId: account.id,
      userName: account.name,
      userRole: account.role,
      userColor,
      canEdit: true,
      activeLockedLines: [],
      lastActivity: Date.now(),
    };

    room.participants.set(socket.id, user);
    return { room, user };
  }

  /**
   * Remove a participant from a room when leaving or disconnecting.
   */
  public removeParticipant(roomId: string, socketId: string): { remainingCount: number; removedUser?: CollabUser } {
    const room = this.rooms.get(roomId);
    if (!room) return { remainingCount: 0 };

    const user = room.participants.get(socketId);
    if (user) {
      this.releaseAllUserLocks(room, user.userId);
      room.participants.delete(socketId);
    }

    const remainingCount = room.participants.size;
    if (remainingCount === 0) {
      this.persistRoomCode(roomId);
    }

    return { remainingCount, removedUser: user };
  }

  /**
   * Convert locks map to a serializable object for clients.
   */
  public getSerializableLocks(room: RoomState): Record<number, LineLock> {
    const result: Record<number, LineLock> = {};
    for (const [line, lock] of room.locks.entries()) {
      result[line] = { ...lock };
    }
    return result;
  }

  /**
   * Convert participants map to an array for clients.
   */
  public getSerializableParticipants(room: RoomState): CollabUser[] {
    return Array.from(room.participants.values());
  }

  /**
   * Find next available line downward that is not locked by another user.
   */
  public findNextAvailableLine(room: RoomState, fromLine: number, requestingUserId: string): number {
    const totalLines = room.lines.length;
    for (let l = fromLine + 1; l <= totalLines; l++) {
      const lock = room.locks.get(l);
      if (!lock || lock.userId === requestingUserId) {
        return l;
      }
    }
    // If all lines below are locked, allocate the next line (appending)
    return totalLines + 1;
  }

  /**
   * Request / acquire a lock on a specific line.
   * Enforces first-come-first-serve priority.
   */
  public acquireLineLock(
    roomId: string,
    socketId: string,
    lineNumber: number
  ): {
    success: boolean;
    lock?: LineLock;
    conflictOwner?: { userId: string; userName: string };
    redirectLine?: number;
    reason?: string;
  } {
    const room = this.getOrCreateRoom(roomId);
    const user = room.participants.get(socketId);
    if (!user) return { success: false, reason: 'Participant not in room' };
    if (user.canEdit === false) {
      return { success: false, reason: 'Your access is currently set to read-only.' };
    }

    const now = Date.now();
    const existingLock = room.locks.get(lineNumber);

    // If already locked by someone else and not expired
    if (existingLock && existingLock.userId !== user.userId) {
      if (existingLock.expiresAt > now) {
        // Line is locked by another user!
        const redirectLine = this.findNextAvailableLine(room, lineNumber, user.userId);
        return {
          success: false,
          conflictOwner: { userId: existingLock.userId, userName: existingLock.userName },
          redirectLine,
          reason: `Line ${lineNumber} is currently being edited by ${existingLock.userName}.`,
        };
      }
      // Stale lock has expired; remove it so it can be acquired
      room.locks.delete(lineNumber);
    }

    // Ensure line exists or can be allocated
    while (room.lines.length < lineNumber) {
      room.lines.push('');
      room.lineIds.push(`ln_${uuid().slice(0, 8)}_${room.lines.length}`);
    }

    const lineId = room.lineIds[lineNumber - 1] || `ln_${uuid().slice(0, 8)}_${lineNumber}`;

    const newLock: LineLock = {
      lineNumber,
      lineId,
      userId: user.userId,
      userName: user.userName,
      userColor: user.userColor,
      socketId,
      lockedAt: now,
      lastActivity: now,
      expiresAt: now + LOCK_INACTIVITY_MS,
    };

    room.locks.set(lineNumber, newLock);
    if (!user.activeLockedLines.includes(lineNumber)) {
      user.activeLockedLines.push(lineNumber);
    }
    user.lastActivity = now;

    return { success: true, lock: newLock };
  }

  /**
   * Release lock on a specific line for a user.
   */
  public releaseLineLock(roomId: string, socketId: string, lineNumber: number): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    const user = room.participants.get(socketId);
    const lock = room.locks.get(lineNumber);

    if (lock && (!user || lock.userId === user.userId)) {
      room.locks.delete(lineNumber);
      if (user) {
        user.activeLockedLines = user.activeLockedLines.filter(l => l !== lineNumber);
      }
      return true;
    }
    return false;
  }

  /**
   * Release all locks held by a user in a room.
   */
  public releaseAllUserLocks(room: RoomState, userId: string): void {
    for (const [line, lock] of Array.from(room.locks.entries())) {
      if (lock.userId === userId) {
        room.locks.delete(line);
      }
    }
    for (const participant of room.participants.values()) {
      if (participant.userId === userId) {
        participant.activeLockedLines = [];
      }
    }
  }

  /**
   * Handle cursor movement: updates user cursor, refreshes activity on locked line,
   * and starts grace period on previously locked lines if moving away.
   */
  public updateCursor(
    roomId: string,
    socketId: string,
    cursor: {
      lineNumber: number;
      column: number;
      selection?: {
        startLineNumber: number;
        startColumn: number;
        endLineNumber: number;
        endColumn: number;
      };
    }
  ): { user?: CollabUser; locksChanged: boolean } {
    const room = this.rooms.get(roomId);
    if (!room) return { locksChanged: false };
    const user = room.participants.get(socketId);
    if (!user) return { locksChanged: false };

    user.cursor = cursor;
    const now = Date.now();
    user.lastActivity = now;
    let locksChanged = false;

    // Check lines previously locked by this user:
    // If the user moved away from a line, set a grace expiration timer
    for (const lineNum of [...user.activeLockedLines]) {
      const lock = room.locks.get(lineNum);
      if (lock && lock.userId === user.userId) {
        if (lineNum === cursor.lineNumber) {
          // User is on this line, refresh activity and clear grace period
          lock.lastActivity = now;
          lock.expiresAt = now + LOCK_INACTIVITY_MS;
          lock.graceExpiresAt = undefined;
        } else {
          // User moved away: start grace period if not already ticking
          if (!lock.graceExpiresAt) {
            lock.graceExpiresAt = now + LOCK_GRACE_PERIOD_MS;
          }
        }
      }
    }

    return { user, locksChanged };
  }

  /**
   * Validate and apply document edits safely with line-lock validation and line shifting.
   */
  public applyDocumentChange(
    roomId: string,
    socketId: string,
    baseVersion: number,
    changes: DocumentChange[],
    clientFullCode?: string
  ): {
    success: boolean;
    newVersion: number;
    fullCode: string;
    locks: Record<number, LineLock>;
    conflict?: {
      lockedLine: number;
      owner: { userId: string; userName: string };
      targetLine: number;
      reason: string;
    };
  } {
    const room = this.getOrCreateRoom(roomId);
    const user = room.participants.get(socketId);
    if (!user) {
      return {
        success: false,
        newVersion: room.version,
        fullCode: room.code,
        locks: this.getSerializableLocks(room),
        conflict: {
          lockedLine: 1,
          owner: { userId: '', userName: 'System' },
          targetLine: 1,
          reason: 'User not connected',
        },
      };
    }

    if (user.canEdit === false) {
      return {
        success: false,
        newVersion: room.version,
        fullCode: room.code,
        locks: this.getSerializableLocks(room),
        conflict: {
          lockedLine: 1,
          owner: { userId: 'host', userName: 'Session Host' },
          targetLine: 1,
          reason: 'Your editing access has been set to read-only.',
        },
      };
    }

    const now = Date.now();

    // 1. Validation: Verify that NO line touched by the change is locked by another participant!
    for (const change of changes) {
      const startLine = change.range.startLineNumber;
      const endLine = change.range.endLineNumber;

      for (let l = startLine; l <= endLine; l++) {
        const lock = room.locks.get(l);
        if (lock && lock.userId !== user.userId && lock.expiresAt > now) {
          // Conflict detected!
          const targetLine = this.findNextAvailableLine(room, l, user.userId);
          return {
            success: false,
            newVersion: room.version,
            fullCode: room.code,
            locks: this.getSerializableLocks(room),
            conflict: {
              lockedLine: l,
              owner: { userId: lock.userId, userName: lock.userName },
              targetLine,
              reason: `Line ${l} is locked by ${lock.userName}. Editing rejected.`,
            },
          };
        }
      }
    }

    // 2. Automatically acquire/refresh locks on all edited lines for the user
    for (const change of changes) {
      const startLine = change.range.startLineNumber;
      const endLine = change.range.endLineNumber;
      for (let l = startLine; l <= endLine; l++) {
        let lock = room.locks.get(l);
        if (!lock) {
          const lineId = room.lineIds[l - 1] || `ln_${uuid().slice(0, 8)}_${l}`;
          lock = {
            lineNumber: l,
            lineId,
            userId: user.userId,
            userName: user.userName,
            userColor: user.userColor,
            socketId,
            lockedAt: now,
            lastActivity: now,
            expiresAt: now + LOCK_INACTIVITY_MS,
          };
          room.locks.set(l, lock);
          if (!user.activeLockedLines.includes(l)) {
            user.activeLockedLines.push(l);
          }
        } else {
          lock.lastActivity = now;
          lock.expiresAt = now + LOCK_INACTIVITY_MS;
          lock.graceExpiresAt = undefined;
        }
      }
    }

    // 3. Apply changes to internal lines & lineIds representation
    for (const change of changes) {
      const { startLineNumber, startColumn, endLineNumber, endColumn } = change.range;
      const newText = change.text;

      // Ensure line array is large enough
      while (room.lines.length < endLineNumber) {
        room.lines.push('');
        room.lineIds.push(`ln_${uuid().slice(0, 8)}_${room.lines.length}`);
      }

      const startIdx = startLineNumber - 1;
      const endIdx = endLineNumber - 1;

      const prefix = (room.lines[startIdx] || '').slice(0, Math.max(0, startColumn - 1));
      const suffix = (room.lines[endIdx] || '').slice(Math.max(0, endColumn - 1));
      const replacement = prefix + newText + suffix;
      const newSubLines = replacement.split('\n');

      const linesDeleted = endIdx - startIdx + 1;
      const linesInserted = newSubLines.length;
      const lineDelta = linesInserted - linesDeleted;

      // Update lines array
      room.lines.splice(startIdx, linesDeleted, ...newSubLines);

      // Update lineIds array with stable tracking
      const oldLineIds = room.lineIds.slice(startIdx, startIdx + linesDeleted);
      const newLineIds: string[] = [];
      for (let i = 0; i < linesInserted; i++) {
        if (i < oldLineIds.length) {
          newLineIds.push(oldLineIds[i]);
        } else {
          newLineIds.push(`ln_${uuid().slice(0, 8)}_${startIdx + i + 1}`);
        }
      }
      room.lineIds.splice(startIdx, linesDeleted, ...newLineIds);

      // 4. Line Shifting: Shift all active locks affected by inserted/deleted lines!
      if (lineDelta !== 0) {
        const updatedLocks = new Map<number, LineLock>();
        for (const [lineNum, lock] of room.locks.entries()) {
          if (lineNum <= startLineNumber) {
            // Lines at or before edit point remain at same line number
            updatedLocks.set(lineNum, lock);
          } else if (lineNum > endLineNumber) {
            // Lines strictly below edit region shift by lineDelta
            const shiftedLineNum = Math.max(1, lineNum + lineDelta);
            lock.lineNumber = shiftedLineNum;
            updatedLocks.set(shiftedLineNum, lock);
          } else {
            // Line was within deleted region
            if (lock.userId === user.userId) {
              // Re-anchor to startLineNumber if owned by editor
              lock.lineNumber = startLineNumber;
              updatedLocks.set(startLineNumber, lock);
            }
            // If owned by someone else, it was deleted (handled by validation above, but remove if stale)
          }
        }
        room.locks = updatedLocks;

        // Update user.activeLockedLines across all participants
        for (const p of room.participants.values()) {
          p.activeLockedLines = Array.from(room.locks.values())
            .filter(l => l.userId === p.userId)
            .map(l => l.lineNumber);
        }
      }
    }

    room.code = room.lines.join('\n');
    room.version += 1;
    user.lastActivity = now;

    // Persist to database if code changed noticeably or periodically
    if (Math.abs(room.code.length - room.lastSavedCode.length) > 50) {
      this.persistRoomCode(roomId);
    }

    return {
      success: true,
      newVersion: room.version,
      fullCode: room.code,
      locks: this.getSerializableLocks(room),
    };
  }

  /**
   * Sweeps expired locks across all rooms.
   */
  private sweepExpiredLocks(): void {
    const now = Date.now();
    for (const [roomId, room] of this.rooms.entries()) {
      let changed = false;
      for (const [line, lock] of Array.from(room.locks.entries())) {
        const isGraceExpired = lock.graceExpiresAt && lock.graceExpiresAt <= now;
        const isInactivityExpired = lock.expiresAt <= now;

        if (isGraceExpired || isInactivityExpired) {
          room.locks.delete(line);
          changed = true;

          // Remove from user's activeLockedLines
          for (const p of room.participants.values()) {
            if (p.userId === lock.userId) {
              p.activeLockedLines = p.activeLockedLines.filter(l => l !== line);
            }
          }
        }
      }

      if (changed && this.io) {
        this.io.to(roomId).emit('locks_updated', { locks: this.getSerializableLocks(room) });
      }
    }
  }

  /**
   * Persist room code to database.
   */
  public persistRoomCode(roomId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;
    try {
      db.prepare('UPDATE collab_sessions SET initial_code = ? WHERE id = ?').run(room.code, roomId);
      room.lastSavedCode = room.code;
    } catch (err) {
      // Non-fatal if DB is busy
    }
  }
}

export const collabManager = new CollabManager();

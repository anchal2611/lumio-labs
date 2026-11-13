import { Server, Socket } from 'socket.io';
import { v4 as uuid } from 'uuid';
import db from '../db/database';
import { verifySocketToken } from '../middleware/auth';
import { collabManager, DocumentChange } from './collabManager';
import { syncCollabPermissionToFirestore } from '../services/firebaseService';

let collabIo: Server | null = null;

export function getCollabIo(): Server | null {
  return collabIo;
}

export function broadcastNotification(userId: string, notification: any): void {
  if (!collabIo) return;
  collabIo.to(`user:${userId}`).emit('notification', notification);
  collabIo.emit('realtime_notification', { userId, notification });
}

export function notifySessionEnded(roomId: string): void {
  collabIo?.to(roomId).emit('session_ended');
}

export function setupCollabSockets(io: Server): void {
  collabIo = io;
  collabManager.setIo(io);

  // Collaboration sockets must use the same verified account identity as HTTP.
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
    if (!token) {
      return next(new Error('Authentication required.'));
    }
    void verifySocketToken(token)
      .then((authUser) => {
        socket.data.authUser = authUser;
        next();
      })
      .catch(() => next(new Error('Invalid or expired authentication token.')));
  });

  io.on('connection', (socket: Socket) => {
    const socketUser = socket.data.authUser;
    let currentRoomId: string | null = null;
    let currentUserId: string | null = null;
    let lastChatAt = 0;

    // Join personal user room so real-time notifications target this user instantly
    if (socketUser?.userId) {
      socket.join(`user:${socketUser.userId}`);
    }

    const isInRoom = (roomId: string) => Boolean(currentUserId && currentRoomId === roomId);

    // ─── Join Room ───────────────────────────────────
    socket.on('join_room', ({ roomId }: { roomId: string }, acknowledge?: (result: { ok: boolean; error?: string; data?: any }) => void) => {
      const reject = (error: string) => {
        socket.emit('room_error', { error });
        acknowledge?.({ ok: false, error });
      };

      if (typeof roomId !== 'string' || !roomId) {
        reject('Invalid session.');
        return;
      }

      const account = db.prepare('SELECT id, name, role FROM users WHERE id = ? AND status = ?').get(socketUser.userId, 'active') as any;
      const session = db.prepare(`
        SELECT cs.id, cs.host_id, cs.class_id, cs.type, cs.is_active, c.teacher_id, c.institute_id
        FROM collab_sessions cs
        LEFT JOIN classes c ON c.id = cs.class_id
        WHERE cs.id = ?
      `).get(roomId) as any;

      if (!account || !session || !session.is_active) {
        reject('This session is unavailable.');
        return;
      }

      const isHost = session.host_id === account.id;
      const isEnrolled = session.class_id
        ? Boolean(db.prepare('SELECT 1 FROM class_enrollments WHERE class_id = ? AND student_id = ?').get(session.class_id, account.id))
        : false;

      const canJoin =
        isHost ||
        (account.role === 'student' && (!session.class_id || isEnrolled)) ||
        (account.role === 'teacher' && (!session.class_id || session.teacher_id === account.id)) ||
        (account.role === 'admin' && Boolean(socketUser.instituteId && session.institute_id === socketUser.instituteId));

      if (!canJoin) {
        reject('You do not have access to this session.');
        return;
      }

      // Leave previous room if any
      if (currentRoomId) {
        socket.leave(currentRoomId);
        const { removedUser } = collabManager.removeParticipant(currentRoomId, socket.id);
        const prevRoom = collabManager.getOrCreateRoom(currentRoomId);
        io.to(currentRoomId).emit('room_participants_updated', collabManager.getSerializableParticipants(prevRoom));
        io.to(currentRoomId).emit('locks_updated', { locks: collabManager.getSerializableLocks(prevRoom) });
        if (removedUser) {
          socket.to(currentRoomId).emit('user_left_room', {
            userName: removedUser.userName,
            timestamp: new Date().toISOString(),
          });
        }
      }

      currentRoomId = roomId;
      currentUserId = account.id;
      socket.join(roomId);

      const { room, user } = collabManager.joinParticipant(roomId, socket, account);
      const serializableLocks = collabManager.getSerializableLocks(room);
      const serializableParticipants = collabManager.getSerializableParticipants(room);

      // Send initial room snapshot to newly joined user
      socket.emit('room_init', {
        roomId,
        code: room.code,
        version: room.version,
        locks: serializableLocks,
        participants: serializableParticipants,
        selfUser: user,
      });

      // Backwards-compatible code_updated
      socket.emit('code_updated', { code: room.code, senderId: 'server', version: room.version });

      // Broadcast updated participants and locks to room
      io.to(roomId).emit('room_participants_updated', serializableParticipants);
      io.to(roomId).emit('locks_updated', { locks: serializableLocks });

      acknowledge?.({
        ok: true,
        data: {
          code: room.code,
          version: room.version,
          locks: serializableLocks,
          participants: serializableParticipants,
          selfUser: user,
        },
      });

      socket.to(roomId).emit('user_joined_room', {
        userId: user.userId,
        userName: user.userName,
        userRole: user.userRole,
        userColor: user.userColor,
        timestamp: new Date().toISOString(),
      });
    });

    // ─── Cursor & Selection Movement ─────────────────
    socket.on(
      'cursor_move',
      ({
        roomId,
        cursor,
        selection,
      }: {
        roomId: string;
        cursor: { lineNumber: number; column: number };
        selection?: { startLineNumber: number; startColumn: number; endLineNumber: number; endColumn: number };
      }) => {
        if (!isInRoom(roomId) || !cursor || typeof cursor.lineNumber !== 'number') return;
        const { user } = collabManager.updateCursor(roomId, socket.id, { ...cursor, selection });
        if (!user) return;

        socket.to(roomId).emit('cursor_updated', {
          userId: user.userId,
          userName: user.userName,
          userRole: user.userRole,
          userColor: user.userColor,
          cursor,
          selection,
          timestamp: Date.now(),
        });
      }
    );

    // ─── Line-Level Lock Request ─────────────────────
    socket.on(
      'request_lock',
      (
        { roomId, lineNumber }: { roomId: string; lineNumber: number },
        acknowledge?: (result: {
          success: boolean;
          lock?: any;
          redirectLine?: number;
          conflictOwner?: { userId: string; userName: string };
          reason?: string;
        }) => void
      ) => {
        if (!isInRoom(roomId) || typeof lineNumber !== 'number' || lineNumber < 1) {
          acknowledge?.({ success: false, reason: 'Invalid line or session.' });
          return;
        }

        const result = collabManager.acquireLineLock(roomId, socket.id, lineNumber);
        const room = collabManager.getOrCreateRoom(roomId);
        const locks = collabManager.getSerializableLocks(room);

        if (result.success) {
          io.to(roomId).emit('locks_updated', { locks });
          io.to(roomId).emit('line_locked', {
            lineNumber,
            lock: result.lock,
          });
          acknowledge?.({ success: true, lock: result.lock });
        } else {
          socket.emit('lock_rejected', {
            requestedLine: lineNumber,
            conflictOwner: result.conflictOwner,
            redirectLine: result.redirectLine,
            reason: result.reason,
            locks,
          });
          acknowledge?.({
            success: false,
            redirectLine: result.redirectLine,
            conflictOwner: result.conflictOwner,
            reason: result.reason,
          });
        }
      }
    );

    // ─── Release Line Lock ───────────────────────────
    socket.on('release_lock', ({ roomId, lineNumber }: { roomId: string; lineNumber: number }) => {
      if (!isInRoom(roomId) || typeof lineNumber !== 'number') return;
      const released = collabManager.releaseLineLock(roomId, socket.id, lineNumber);
      if (released) {
        const room = collabManager.getOrCreateRoom(roomId);
        io.to(roomId).emit('locks_updated', { locks: collabManager.getSerializableLocks(room) });
        io.to(roomId).emit('line_unlocked', { lineNumber });
      }
    });

    // ─── Document Change Synchronization (Fine-Grained OT) ───
    socket.on(
      'doc_change',
      (
        {
          roomId,
          baseVersion,
          changes,
          fullCode,
        }: {
          roomId: string;
          baseVersion: number;
          changes: DocumentChange[];
          fullCode?: string;
        },
        acknowledge?: (result: {
          success: boolean;
          version?: number;
          locks?: any;
          conflict?: any;
          fullCode?: string;
        }) => void
      ) => {
        if (!isInRoom(roomId) || !Array.isArray(changes)) {
          acknowledge?.({ success: false });
          return;
        }

        const room = collabManager.getOrCreateRoom(roomId);
        const participant = room.participants.get(socket.id);
        const result = collabManager.applyDocumentChange(roomId, socket.id, baseVersion, changes, fullCode);

        if (result.success) {
          // Broadcast applied change to other room participants
          socket.to(roomId).emit('doc_change_applied', {
            senderId: participant?.userId,
            senderName: participant?.userName,
            version: result.newVersion,
            changes,
            fullCode: result.fullCode,
            locks: result.locks,
          });

          // Acknowledge change to sender
          socket.emit('doc_change_ack', {
            version: result.newVersion,
            locks: result.locks,
          });

          // Backwards-compatible code_updated event
          socket.to(roomId).emit('code_updated', {
            code: result.fullCode,
            senderId: participant?.userId,
            version: result.newVersion,
          });

          acknowledge?.({
            success: true,
            version: result.newVersion,
            locks: result.locks,
          });
        } else {
          // Conflict: Line is locked by someone else!
          socket.emit('doc_change_rejected', {
            conflict: result.conflict,
            fullCode: result.fullCode,
            version: result.newVersion,
            locks: result.locks,
          });

          acknowledge?.({
            success: false,
            conflict: result.conflict,
            fullCode: result.fullCode,
            version: result.newVersion,
            locks: result.locks,
          });
        }
      }
    );

    // ─── Legacy Whole-Document Code Sync (Fallback) ───
    socket.on('code_change', ({ roomId, code }: { roomId: string; code: string }) => {
      if (!isInRoom(roomId) || typeof code !== 'string' || code.length > 100_000) return;
      const room = collabManager.getOrCreateRoom(roomId);
      const participant = room.participants.get(socket.id);

      // Check if any other user's active lock exists
      const now = Date.now();
      const hasOtherUserLocks = Array.from(room.locks.values()).some(
        (l) => l.userId !== participant?.userId && l.expiresAt > now
      );

      if (hasOtherUserLocks) {
        // Reject whole-file replacement if other users hold locks
        socket.emit('doc_change_rejected', {
          conflict: {
            lockedLine: 1,
            owner: { userId: '', userName: 'Collaborator' },
            targetLine: 1,
            reason: 'Cannot replace whole document while lines are locked by other participants.',
          },
          fullCode: room.code,
          version: room.version,
          locks: collabManager.getSerializableLocks(room),
        });
        return;
      }

      room.code = code;
      room.lines = code.split('\n');
      room.lineIds = room.lines.map((_, i) => room.lineIds[i] || `ln_${uuid().slice(0, 8)}_${i + 1}`);
      room.version += 1;

      socket.to(roomId).emit('code_updated', {
        code,
        senderId: participant?.userId,
        version: room.version,
      });
      io.to(roomId).emit('locks_updated', { locks: collabManager.getSerializableLocks(room) });
    });

    // ─── Lab Exercise Sync ───────────────────────────
    socket.on('lab_exercise_change', ({ roomId, exerciseId, code }: { roomId: string; exerciseId: string; code: string }) => {
      if (!isInRoom(roomId) || typeof code !== 'string' || code.length > 100_000) return;
      socket.to(roomId).emit('lab_exercise_updated', { exerciseId, code, senderId: currentUserId });
    });

    // ─── Share Output ─────────────────────────────────
    socket.on('share_output', ({ roomId, output }: { roomId: string; output: string }) => {
      if (!isInRoom(roomId) || typeof output !== 'string' || output.length > 50_000) return;
      const room = collabManager.getOrCreateRoom(roomId);
      const participant = room.participants.get(socket.id);
      socket.to(roomId).emit('output_shared', { output, senderName: participant?.userName });
    });

    // ─── Live Chat ────────────────────────────────────
    socket.on(
      'send_chat',
      (
        { roomId, message }: { roomId: string; message: any },
        acknowledge?: (result: { ok: boolean; error?: string; message?: any }) => void
      ) => {
        if (!isInRoom(roomId) || typeof message?.text !== 'string' || !message.text.trim()) {
          acknowledge?.({ ok: false, error: 'Join the session before sending a message.' });
          return;
        }
        if (Date.now() - lastChatAt < 300) {
          acknowledge?.({ ok: false, error: 'Please wait a moment before sending another message.' });
          return;
        }
        lastChatAt = Date.now();
        const room = collabManager.getOrCreateRoom(roomId);
        const participant = room.participants.get(socket.id);
        const chatMessage = {
          id: typeof message.id === 'string' ? message.id.slice(0, 80) : uuid(),
          senderName: participant?.userName,
          text: message.text.trim().slice(0, 5000),
          timestamp: new Date().toISOString(),
        };
        io.to(roomId).emit('chat_received', chatMessage);
        acknowledge?.({ ok: true, message: chatMessage });
      }
    );

    // ─── Teacher Broadcast ────────────────────────────
    socket.on('teacher_broadcast', ({ roomId, type, data }: { roomId: string; type: string; data: any }) => {
      const room = collabManager.getOrCreateRoom(roomId);
      const participant = room.participants.get(socket.id);
      if (participant?.userRole !== 'teacher' || !isInRoom(roomId)) return;
      socket.to(roomId).emit('teacher_broadcast_received', { type, data, teacherName: participant.userName });
    });

    // ─── Set Participant Permission ──────────────────
    socket.on(
      'set_user_permission',
      ({
        roomId,
        targetUserId,
        canEdit,
        reason,
      }: {
        roomId: string;
        targetUserId: string;
        canEdit: boolean;
        reason?: string;
      }) => {
        if (!isInRoom(roomId) || !targetUserId) return;
        const room = collabManager.getOrCreateRoom(roomId);
        const requester = room.participants.get(socket.id);
        if (!requester) return;

        const session = db.prepare('SELECT host_id FROM collab_sessions WHERE id = ?').get(roomId) as any;
        const isHost = session?.host_id === requester.userId;
        const isTeacherOrAdmin = requester.userRole === 'teacher' || requester.userRole === 'admin';

        if (!isHost && !isTeacherOrAdmin) {
          socket.emit('permission_error', {
            error: 'Only the session host or instructor can adjust editing permissions.',
          });
          return;
        }

        const requesterName = requester.userName || 'Instructor';

        // Update target user's permission
        for (const [targetSocketId, p] of room.participants.entries()) {
          if (p.userId === targetUserId) {
            p.canEdit = canEdit;
            io.to(targetSocketId).emit('permission_updated', {
              canEdit,
              changedBy: requesterName,
              reason:
                reason ||
                (canEdit
                  ? 'Granted full collaborative editing privileges.'
                  : 'Changed to read-only viewing mode.'),
            });
          }
        }

        // Broadcast updated participant permissions to room
        io.to(roomId).emit('room_participants_updated', collabManager.getSerializableParticipants(room));

        // Persist notification for target user
        const notifTitle = canEdit
          ? 'Collab: Editing Access Granted'
          : 'Collab: Access Changed to Read-Only';
        const notifBody = `${requesterName} ${
          canEdit ? 'granted you editing permissions' : 'changed your access to read-only'
        } in collaboration session.`;

        const notifId = uuid();
        const createdAt = new Date().toISOString();
        db.prepare(
          `INSERT INTO notifications (id, user_id, type, title, body, link, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`
        ).run(
          notifId,
          targetUserId,
          'collab_permission',
          notifTitle,
          notifBody,
          '/student/collaboration',
          createdAt
        );

        const notifObj = {
          id: notifId,
          userId: targetUserId,
          type: 'collab_permission',
          title: notifTitle,
          body: notifBody,
          link: '/student/collaboration',
          read_at: null,
          created_at: createdAt,
        };

        // Push real-time notification
        broadcastNotification(targetUserId, notifObj);

        // Sync to Firebase
        void syncCollabPermissionToFirestore({
          roomId,
          userId: targetUserId,
          canEdit,
          grantedBy: requesterName,
        });
      }
    );

    // ─── Disconnect ───────────────────────────────────
    socket.on('disconnect', () => {
      if (currentRoomId) {
        const { remainingCount, removedUser } = collabManager.removeParticipant(currentRoomId, socket.id);
        const room = collabManager.getOrCreateRoom(currentRoomId);
        const locks = collabManager.getSerializableLocks(room);
        const participants = collabManager.getSerializableParticipants(room);

        io.to(currentRoomId).emit('room_participants_updated', participants);
        io.to(currentRoomId).emit('locks_updated', { locks });

        if (removedUser) {
          socket.to(currentRoomId).emit('user_left_room', {
            userName: removedUser.userName,
            timestamp: new Date().toISOString(),
          });
        }
      }
    });
  });
}

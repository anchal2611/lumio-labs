import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import db from '../db/database';
import { JWT_SECRET } from '../middleware/auth';

interface RoomParticipant {
  socketId: string;
  userId: string;
  userName: string;
  userRole: string;
  cursor?: { lineNumber: number; column: number };
}

const activeRooms: Record<string, RoomParticipant[]> = {};
const roomCode: Record<string, string> = {};
let collabIo: Server | null = null;

export function notifySessionEnded(roomId: string): void {
  collabIo?.to(roomId).emit('session_ended');
}

export function setupCollabSockets(io: Server): void {
  collabIo = io;
  // Collaboration sockets must use the same verified account identity as HTTP.
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
    if (!token) {
      return next(new Error('Authentication required.'));
    }
    try {
      socket.data.authUser = jwt.verify(token, JWT_SECRET) as any;
      next();
    } catch {
      next(new Error('Invalid or expired authentication token.'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const socketUser = socket.data.authUser;
    let currentRoomId: string | null = null;
    let currentUser: RoomParticipant | null = null;
    const isInRoom = (roomId: string) => Boolean(currentUser && currentRoomId === roomId);

    // ─── Join Room ───────────────────────────────────
    socket.on('join_room', ({ roomId }: { roomId: string }) => {
      if (typeof roomId !== 'string' || !roomId) return;
      const account = db.prepare('SELECT id, name, role FROM users WHERE id = ? AND status = ?').get(socketUser.userId, 'active') as any;
      const session = db.prepare(`
        SELECT cs.id, cs.host_id, cs.class_id, cs.type, cs.is_active, c.teacher_id
        FROM collab_sessions cs
        LEFT JOIN classes c ON c.id = cs.class_id
        WHERE cs.id = ?
      `).get(roomId) as any;
      if (!account || !session || !session.is_active) {
        socket.emit('room_error', { error: 'This session is unavailable.' });
        return;
      }
      const isHost = session.host_id === account.id;
      const isEnrolled = session.class_id
        ? Boolean(db.prepare('SELECT 1 FROM class_enrollments WHERE class_id = ? AND student_id = ?').get(session.class_id, account.id))
        : false;
      const canJoin = isHost || (account.role === 'student' && (!session.class_id || isEnrolled)) ||
        (account.role === 'teacher' && (!session.class_id || session.teacher_id === account.id));
      if (!canJoin) {
        socket.emit('room_error', { error: 'You do not have access to this session.' });
        return;
      }

      if (currentRoomId) {
        socket.leave(currentRoomId);
        if (activeRooms[currentRoomId]) {
          activeRooms[currentRoomId] = activeRooms[currentRoomId].filter(p => p.socketId !== socket.id);
          io.to(currentRoomId).emit('room_participants_updated', activeRooms[currentRoomId]);
        }
      }

      currentRoomId = roomId;
      socket.join(roomId);

      currentUser = {
        socketId: socket.id,
        userId: account.id,
        userName: account.name,
        userRole: account.role,
      };

      if (!activeRooms[roomId]) activeRooms[roomId] = [];
      activeRooms[roomId].push(currentUser);

      // Send current room code to newly joined user
      if (roomCode[roomId]) {
        socket.emit('code_updated', { code: roomCode[roomId], senderId: 'server' });
      }

      io.to(roomId).emit('room_participants_updated', activeRooms[roomId]);
      socket.to(roomId).emit('user_joined_room', {
        userName: currentUser.userName,
        userRole: currentUser.userRole,
        timestamp: new Date().toISOString(),
      });
    });

    // ─── Code Sync ───────────────────────────────────
    socket.on('code_change', ({ roomId, code }: { roomId: string; code: string }) => {
      if (!isInRoom(roomId) || typeof code !== 'string' || code.length > 100_000) return;
      roomCode[roomId] = code; // persist latest code in memory
      socket.to(roomId).emit('code_updated', { code, senderId: currentUser?.userId });
    });

    // ─── Lab Exercise Sync (for collaborative lab work) ──
    socket.on('lab_exercise_change', ({ roomId, exerciseId, code }: { roomId: string; exerciseId: string; code: string }) => {
      if (!isInRoom(roomId) || typeof code !== 'string' || code.length > 100_000) return;
      socket.to(roomId).emit('lab_exercise_updated', { exerciseId, code, senderId: currentUser?.userId });
    });

    // ─── Share Output ─────────────────────────────────
    socket.on('share_output', ({ roomId, output }: { roomId: string; output: string }) => {
      if (!isInRoom(roomId) || typeof output !== 'string' || output.length > 50_000) return;
      socket.to(roomId).emit('output_shared', { output, senderName: currentUser?.userName });
    });

    // ─── Cursor Movement ─────────────────────────────
    socket.on('cursor_move', ({ roomId, cursor }: { roomId: string; cursor: { lineNumber: number; column: number } }) => {
      if (!isInRoom(roomId)) return;
      if (currentUser) currentUser.cursor = cursor;
      socket.to(roomId).emit('cursor_updated', {
        userId: currentUser?.userId,
        userName: currentUser?.userName,
        cursor,
      });
    });

    // ─── Live Chat ────────────────────────────────────
    socket.on('send_chat', ({ roomId, message }: { roomId: string; message: any }) => {
      if (!isInRoom(roomId) || typeof message?.text !== 'string' || !message.text.trim()) return;
      io.to(roomId).emit('chat_received', {
        id: typeof message.id === 'string' ? message.id : uuid(),
        senderName: currentUser?.userName,
        text: message.text.trim().slice(0, 5000),
        timestamp: new Date().toISOString(),
      });
    });

    // ─── Teacher Broadcast (class sessions) ──────────
    socket.on('teacher_broadcast', ({ roomId, type, data }: { roomId: string; type: string; data: any }) => {
      if (currentUser?.userRole !== 'teacher' || !isInRoom(roomId)) return;
      socket.to(roomId).emit('teacher_broadcast_received', { type, data, teacherName: currentUser.userName });
    });

    // ─── Disconnect ───────────────────────────────────
    socket.on('disconnect', () => {
      if (currentRoomId && activeRooms[currentRoomId]) {
        activeRooms[currentRoomId] = activeRooms[currentRoomId].filter(p => p.socketId !== socket.id);
        io.to(currentRoomId).emit('room_participants_updated', activeRooms[currentRoomId]);

        if (currentUser) {
          socket.to(currentRoomId).emit('user_left_room', {
            userName: currentUser.userName,
            timestamp: new Date().toISOString(),
          });
        }

        // Clean up empty room code cache
        if (activeRooms[currentRoomId].length === 0) {
          delete roomCode[currentRoomId];
        }
      }
    });
  });
}

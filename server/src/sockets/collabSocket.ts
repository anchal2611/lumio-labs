import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../middleware/auth.js';

interface RoomParticipant {
  socketId: string;
  userId: string;
  userName: string;
  userRole: string;
  cursor?: { lineNumber: number; column: number };
}

const activeRooms: Record<string, RoomParticipant[]> = {};
const roomCode: Record<string, string> = {};

export function setupCollabSockets(io: Server): void {
  // JWT authentication middleware for socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.replace('Bearer ', '');
    if (!token) {
      // Allow connection but mark as unauthenticated guest (for demo)
      (socket as any).user = { userId: `guest_${socket.id}`, userName: 'Guest', userRole: 'student' };
      return next();
    }
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      (socket as any).user = { userId: decoded.userId, userName: decoded.email, userRole: decoded.role };
      next();
    } catch {
      (socket as any).user = { userId: `guest_${socket.id}`, userName: 'Guest', userRole: 'student' };
      next();
    }
  });

  io.on('connection', (socket: Socket) => {
    const socketUser = (socket as any).user;
    let currentRoomId: string | null = null;
    let currentUser: RoomParticipant | null = null;

    // ─── Join Room ───────────────────────────────────
    socket.on('join_room', ({ roomId, user }: { roomId: string; user?: { id?: string; name?: string; role?: string } }) => {
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
        userId: user?.id || socketUser.userId,
        userName: user?.name || socketUser.userName,
        userRole: user?.role || socketUser.userRole,
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
      roomCode[roomId] = code; // persist latest code in memory
      socket.to(roomId).emit('code_updated', { code, senderId: currentUser?.userId });
    });

    // ─── Lab Exercise Sync (for collaborative lab work) ──
    socket.on('lab_exercise_change', ({ roomId, exerciseId, code }: { roomId: string; exerciseId: string; code: string }) => {
      socket.to(roomId).emit('lab_exercise_updated', { exerciseId, code, senderId: currentUser?.userId });
    });

    // ─── Share Output ─────────────────────────────────
    socket.on('share_output', ({ roomId, output }: { roomId: string; output: string }) => {
      socket.to(roomId).emit('output_shared', { output, senderName: currentUser?.userName });
    });

    // ─── Cursor Movement ─────────────────────────────
    socket.on('cursor_move', ({ roomId, cursor }: { roomId: string; cursor: { lineNumber: number; column: number } }) => {
      if (currentUser) currentUser.cursor = cursor;
      socket.to(roomId).emit('cursor_updated', {
        userId: currentUser?.userId,
        userName: currentUser?.userName,
        cursor,
      });
    });

    // ─── Live Chat ────────────────────────────────────
    socket.on('send_chat', ({ roomId, message }: { roomId: string; message: any }) => {
      io.to(roomId).emit('chat_received', {
        ...message,
        senderName: message.senderName || currentUser?.userName,
        timestamp: new Date().toISOString(),
      });
    });

    // ─── Teacher Broadcast (class sessions) ──────────
    socket.on('teacher_broadcast', ({ roomId, type, data }: { roomId: string; type: string; data: any }) => {
      if (currentUser?.userRole !== 'teacher') return;
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

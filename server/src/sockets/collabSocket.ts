import { Server, Socket } from 'socket.io';

interface RoomParticipant {
  socketId: string;
  userId: string;
  userName: string;
  userRole: string;
  cursor?: { lineNumber: number; column: number };
}

const activeRooms: Record<string, RoomParticipant[]> = {};

export function setupCollabSockets(io: Server): void {
  io.on('connection', (socket: Socket) => {
    let currentRoomId: string | null = null;
    let currentUser: RoomParticipant | null = null;

    // Join collaborative room
    socket.on('join_room', ({ roomId, user }: { roomId: string; user: { id: string; name: string; role: string } }) => {
      currentRoomId = roomId;
      socket.join(roomId);

      currentUser = {
        socketId: socket.id,
        userId: user.id,
        userName: user.name,
        userRole: user.role,
      };

      if (!activeRooms[roomId]) {
        activeRooms[roomId] = [];
      }
      activeRooms[roomId].push(currentUser);

      // Broadcast updated participant list to room
      io.to(roomId).emit('room_participants_updated', activeRooms[roomId]);

      socket.to(roomId).emit('user_joined_room', {
        userName: user.name,
        userRole: user.role,
        timestamp: new Date().toISOString(),
      });
    });

    // Real-time code change broadcast
    socket.on('code_change', ({ roomId, code }: { roomId: string; code: string }) => {
      socket.to(roomId).emit('code_updated', { code, senderId: currentUser?.userId });
    });

    // Real-time cursor movement broadcast
    socket.on('cursor_move', ({ roomId, cursor }: { roomId: string; cursor: { lineNumber: number; column: number } }) => {
      if (currentUser) {
        currentUser.cursor = cursor;
      }
      socket.to(roomId).emit('cursor_updated', {
        userId: currentUser?.userId,
        userName: currentUser?.userName,
        cursor,
      });
    });

    // In-room live chat
    socket.on('send_chat', ({ roomId, message }: { roomId: string; message: any }) => {
      io.to(roomId).emit('chat_received', message);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      if (currentRoomId && activeRooms[currentRoomId]) {
        activeRooms[currentRoomId] = activeRooms[currentRoomId].filter(
          (p) => p.socketId !== socket.id
        );
        io.to(currentRoomId).emit('room_participants_updated', activeRooms[currentRoomId]);
      }
    });
  });
}

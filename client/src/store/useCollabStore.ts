import { create } from 'zustand';
import { CollabRoom, ChatMessage, DoubtThread, DoubtReply } from '../types/collaboration';
import { MOCK_COLLAB_ROOMS, MOCK_DOUBTS } from '../services/mockData';

interface CollabState {
  rooms: CollabRoom[];
  activeRoom: CollabRoom | null;
  messages: Record<string, ChatMessage[]>;
  doubts: DoubtThread[];
  activeDoubt: DoubtThread | null;

  setActiveRoom: (room: CollabRoom | null) => void;
  createRoom: (room: Omit<CollabRoom, 'id' | 'createdAt' | 'participants'>) => CollabRoom;
  sendMessage: (roomId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateRoomCode: (roomId: string, code: string) => void;
  postDoubt: (doubt: Omit<DoubtThread, 'id' | 'createdAt' | 'replies' | 'repliesCount' | 'isResolved'>) => void;
  replyToDoubt: (doubtId: string, reply: Omit<DoubtReply, 'id' | 'createdAt'>) => void;
  endorseReply: (doubtId: string, replyId: string) => void;
  resolveDoubt: (doubtId: string) => void;
}

export const useCollabStore = create<CollabState>((set, get) => ({
  rooms: MOCK_COLLAB_ROOMS,
  activeRoom: MOCK_COLLAB_ROOMS[0],
  messages: {
    'room-dsa-01': [
      {
        id: 'msg-1',
        roomId: 'room-dsa-01',
        senderId: 'usr_student_02',
        senderName: 'Priya Sharma',
        senderRole: 'student',
        content: 'Hey Alex! I just added the priority queue relaxation loop on line 24.',
        timestamp: '2026-11-01T14:05:00Z',
      },
      {
        id: 'msg-2',
        roomId: 'room-dsa-01',
        senderId: 'usr_student_01',
        senderName: 'Alex Chen',
        senderRole: 'student',
        content: 'Awesome, checking the test graph in main(). Let\'s compile and run it to verify shortest path weights.',
        timestamp: '2026-11-01T14:06:30Z',
      },
      {
        id: 'msg-3',
        roomId: 'room-dsa-01',
        senderId: 'usr_student_03',
        senderName: 'Liam O\'Connor',
        senderRole: 'student',
        content: 'Looks clean! All 5 nodes have verified minimum distances.',
        timestamp: '2026-11-01T14:08:10Z',
      },
    ],
  },
  doubts: MOCK_DOUBTS,
  activeDoubt: MOCK_DOUBTS[0],

  setActiveRoom: (room) => set({ activeRoom: room }),

  createRoom: (roomData) => {
    const newRoom: CollabRoom = {
      ...roomData,
      id: `room-${Date.now()}`,
      createdAt: new Date().toISOString(),
      participants: [
        {
          id: roomData.hostId,
          name: roomData.hostName,
          role: 'student',
          color: '#2563EB',
          isOnline: true,
        },
      ],
    };

    set((state) => ({
      rooms: [newRoom, ...state.rooms],
      activeRoom: newRoom,
    }));

    return newRoom;
  },

  sendMessage: (roomId, msgData) => {
    const newMsg: ChatMessage = {
      ...msgData,
      id: `msg-${Date.now()}`,
      timestamp: new Date().toISOString(),
      roomId,
    };

    set((state) => {
      const roomMsgs = state.messages[roomId] || [];
      return {
        messages: {
          ...state.messages,
          [roomId]: [...roomMsgs, newMsg],
        },
      };
    });

    // Simulate smart peer bot response in demo mode after 3 seconds
    if (msgData.senderName === 'Alex Chen') {
      setTimeout(() => {
        const peerReply: ChatMessage = {
          id: `msg-${Date.now()}`,
          roomId,
          senderId: 'usr_student_02',
          senderName: 'Priya Sharma',
          senderRole: 'student',
          content: 'Got your update! I am checking the memory complexity now.',
          timestamp: new Date().toISOString(),
        };
        set((state) => {
          const roomMsgs = state.messages[roomId] || [];
          return {
            messages: {
              ...state.messages,
              [roomId]: [...roomMsgs, peerReply],
            },
          };
        });
      }, 3000);
    }
  },

  updateRoomCode: (roomId, code) =>
    set((state) => ({
      rooms: state.rooms.map((r) => (r.id === roomId ? { ...r, code } : r)),
      activeRoom: state.activeRoom?.id === roomId ? { ...state.activeRoom, code } : state.activeRoom,
    })),

  postDoubt: (doubtData) =>
    set((state) => {
      const newDoubt: DoubtThread = {
        ...doubtData,
        id: `doubt-${Date.now()}`,
        createdAt: new Date().toISOString(),
        isResolved: false,
        repliesCount: 0,
        replies: [],
      };
      return {
        doubts: [newDoubt, ...state.doubts],
        activeDoubt: newDoubt,
      };
    }),

  replyToDoubt: (doubtId, replyData) =>
    set((state) => {
      const newReply: DoubtReply = {
        ...replyData,
        id: `rep-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };

      return {
        doubts: state.doubts.map((d) =>
          d.id === doubtId
            ? {
                ...d,
                repliesCount: d.repliesCount + 1,
                replies: [...d.replies, newReply],
              }
            : d
        ),
      };
    }),

  endorseReply: (doubtId, replyId) =>
    set((state) => ({
      doubts: state.doubts.map((d) =>
        d.id === doubtId
          ? {
              ...d,
              replies: d.replies.map((r) => (r.id === replyId ? { ...r, isEndorsedByTeacher: true } : r)),
            }
          : d
      ),
    })),

  resolveDoubt: (doubtId) =>
    set((state) => ({
      doubts: state.doubts.map((d) => (d.id === doubtId ? { ...d, isResolved: true } : d)),
    })),
}));

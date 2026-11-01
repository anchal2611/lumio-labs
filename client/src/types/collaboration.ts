import { SupportedLanguage } from './lab';
import { UserRole } from './auth';

export interface CollabParticipant {
  id: string;
  name: string;
  role: UserRole;
  avatar?: string;
  color: string;
  cursor?: { lineNumber: number; column: number };
  isOnline: boolean;
  activeFile?: string;
}

export interface CollabRoom {
  id: string;
  roomCode: string;
  title: string;
  description: string;
  labCategory: string;
  language: SupportedLanguage;
  hostId: string;
  hostName: string;
  isPrivate: boolean;
  code: string;
  createdAt: string;
  participants: CollabParticipant[];
  tags: string[];
}

export interface ChatMessage {
  id: string;
  roomId?: string;
  conversationId?: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  codeSnippet?: {
    language: string;
    code: string;
  };
}

export interface PeerReviewComment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  lineNumber: number;
  comment: string;
  createdAt: string;
  isResolved: boolean;
}

export interface DoubtReply {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  authorAvatar?: string;
  content: string;
  createdAt: string;
  isEndorsedByTeacher: boolean;
}

export interface DoubtThread {
  id: string;
  title: string;
  description: string;
  codeSnippet?: string;
  language?: SupportedLanguage;
  category: string;
  studentId: string;
  studentName: string;
  studentDepartment: string;
  tags: string[];
  isResolved: boolean;
  repliesCount: number;
  createdAt: string;
  replies: DoubtReply[];
}

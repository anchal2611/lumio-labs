export type NotificationType = 
  | 'assignment_new'
  | 'deadline_approaching'
  | 'teacher_feedback'
  | 'new_message'
  | 'collaboration_invite'
  | 'submission_graded'
  | 'announcement';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  createdAt: string;
  isRead: boolean;
  meta?: Record<string, any>;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorName: string;
  authorRole: 'teacher' | 'admin';
  targetRole: 'all' | 'students' | 'teachers';
  department?: string;
  createdAt: string;
  priority: 'low' | 'normal' | 'urgent';
}

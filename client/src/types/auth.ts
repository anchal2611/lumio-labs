export type UserRole = 'student' | 'teacher' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  university: string;
  department: string;
  branch?: string;
  semester?: number; // for students
  designation?: string; // for teachers
  joinedAt: string;
  isVerified: boolean;
  status: 'active' | 'inactive' | 'suspended';
  rollNumber?: string;
}

export interface RegisterFormData {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  university: string;
  department: string;
  branch: string;
  semester?: number;
  designation?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

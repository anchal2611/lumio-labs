export type UserRole = 'student' | 'teacher' | 'admin';

export interface InstituteInfo {
  id: string;
  name: string;
  slug: string;
}

export interface StudentProfile {
  rollNumber?: string;
  branch?: string;
  semester?: number;
  department?: string;
}

export interface TeacherProfile {
  designation?: string;
  department?: string;
  employeeId?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  instituteId: string | null;
  institute: InstituteInfo | null;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  profile?: StudentProfile & TeacherProfile;
  // Legacy compat fields
  university?: string;
  department?: string;
  branch?: string;
  semester?: number;
  designation?: string;
  rollNumber?: string;
  joinedAt?: string;
  isVerified?: boolean;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  branch?: string;
  semester?: number;
  department?: string;
  designation?: string;
  employeeId?: string;
  rollNumber?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: UserProfile;
}

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, UserRole, RegisterFormData } from '../types/auth';
import { DEMO_USERS } from '../services/mockData';
import { config } from '../config/env';

interface AuthContextValue {
  user: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  isStudent: boolean;
  isTeacher: boolean;
  isAdmin: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  register: (data: RegisterFormData) => Promise<boolean>;
  logout: () => void;
  switchDemoRole: (targetRole: UserRole) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'lumio_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    // Default to student persona for immediate high-fidelity testing
    return DEMO_USERS.student;
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, [user]);

  const login = useCallback(async (email: string, _password?: string): Promise<boolean> => {
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 400));

    // Match demo user email if exists, or generate valid profile
    const matched = Object.values(DEMO_USERS).find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (matched) {
      setUser(matched);
      setIsLoading(false);
      return true;
    }

    // Default to student persona if arbitrary email
    const customUser: UserProfile = {
      id: `usr_${Date.now()}`,
      email,
      name: email.split('@')[0].replace(/[._]/g, ' '),
      role: 'student',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      university: 'Apex Institute of Technology',
      department: 'Computer Science & Engineering',
      branch: 'Software Engineering',
      semester: 4,
      joinedAt: new Date().toISOString(),
      isVerified: true,
      status: 'active',
      rollNumber: `CS-${new Date().getFullYear()}-099`,
    };

    setUser(customUser);
    setIsLoading(false);
    return true;
  }, []);

  const register = useCallback(async (data: RegisterFormData): Promise<boolean> => {
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 400));

    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      email: data.email,
      name: data.fullName,
      role: data.role,
      university: data.university,
      department: data.department,
      branch: data.branch,
      semester: data.semester,
      designation: data.designation,
      joinedAt: new Date().toISOString(),
      isVerified: true,
      status: 'active',
      rollNumber: data.role === 'student' ? `CS-${new Date().getFullYear()}-${Math.floor(Math.random() * 800) + 100}` : undefined,
    };

    setUser(newUser);
    setIsLoading(false);
    return true;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }, []);

  const switchDemoRole = useCallback((targetRole: UserRole) => {
    if (DEMO_USERS[targetRole]) {
      setUser(DEMO_USERS[targetRole]);
    }
  }, []);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

  const role = user?.role || 'student';
  const isAuthenticated = Boolean(user);
  const isStudent = role === 'student';
  const isTeacher = role === 'teacher';
  const isAdmin = role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        isLoading,
        isStudent,
        isTeacher,
        isAdmin,
        login,
        register,
        logout,
        switchDemoRole,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

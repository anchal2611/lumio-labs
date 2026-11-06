import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile, UserRole, RegisterFormData, LoginFormData } from '../types/auth';
import { apiPost, apiGet, setTokens, clearTokens, getToken } from '../services/api';

interface AuthContextValue {
  user: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  isStudent: boolean;
  isTeacher: boolean;
  isAdmin: boolean;
  login: (data: LoginFormData) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const USER_KEY = 'lumio_auth_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(USER_KEY);
      if (saved && getToken()) return JSON.parse(saved);
    } catch { /* ignore */ }
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(getToken() && !localStorage.getItem(USER_KEY)));

  // On mount: if token exists but no user, fetch from /api/auth/me
  useEffect(() => {
    if (getToken() && !user) {
      setIsLoading(true);
      apiGet<UserProfile>('/auth/me')
        .then((u) => { setUser(u); localStorage.setItem(USER_KEY, JSON.stringify(u)); })
        .catch(() => { clearTokens(); })
        .finally(() => setIsLoading(false));
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  }, [user]);

  const login = useCallback(async (data: LoginFormData): Promise<void> => {
    setIsLoading(true);
    try {
      const res: any = await apiPost('/auth/login', data);
      setTokens(res.token, res.refreshToken);
      setUser(res.user);
      localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterFormData): Promise<void> => {
    setIsLoading(true);
    try {
      const res: any = await apiPost('/auth/register', data);
      setTokens(res.token, res.refreshToken);
      setUser(res.user);
      localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      const refreshToken = localStorage.getItem('lumio_refresh_token');
      if (refreshToken) await apiPost('/auth/logout', { refreshToken }).catch(() => {});
    } finally {
      clearTokens();
      setUser(null);
    }
  }, []);

  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      const u = await apiGet<UserProfile>('/auth/me');
      setUser(u);
      localStorage.setItem(USER_KEY, JSON.stringify(u));
    } catch { /* ignore */ }
  }, []);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  }, []);

  const role = user?.role || 'student';

  return (
    <AuthContext.Provider value={{
      user,
      role,
      isAuthenticated: Boolean(user),
      isLoading,
      isStudent: role === 'student',
      isTeacher: role === 'teacher',
      isAdmin: role === 'admin',
      login,
      register,
      logout,
      updateProfile,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

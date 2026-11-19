import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { apiGet, apiPatch, getAuthToken } from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { config } from '../config/env';

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  link?: string | null;
  read_at?: string | null;
  created_at: string;
}

interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  loadNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  openNotification: (notification: AppNotification) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { info: showInfoToast, success: showSuccessToast } = useToast();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const seenIdsRef = useRef<Set<string>>(new Set());

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await apiGet<{ notifications: AppNotification[] }>('/notifications?limit=50');
      const list = data.notifications || [];
      list.forEach((n) => seenIdsRef.current.add(n.id));
      setNotifications(list);
    } catch {
      // Background fetch, avoid breaking UI
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Initial load when user logs in
  useEffect(() => {
    if (user) {
      void loadNotifications();
    } else {
      setNotifications([]);
      seenIdsRef.current.clear();
    }
  }, [user, loadNotifications]);

  // Keep the inbox current if a WebSocket reconnects late or the tab was asleep.
  useEffect(() => {
    if (!user) return;
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') void loadNotifications();
    };
    const timer = window.setInterval(refreshWhenVisible, 30_000);
    window.addEventListener('focus', refreshWhenVisible);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener('focus', refreshWhenVisible);
    };
  }, [user, loadNotifications]);

  // 1. Socket.IO Real-Time Push Connection
  useEffect(() => {
    if (!user) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    let disposed = false;
    let socket: Socket | null = null;
    void getAuthToken().then((token) => {
      if (disposed || !token) return;

      socket = io(config.socketUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
      });
      socketRef.current = socket;

      const acceptNotification = (notification: AppNotification) => {
        if (!notification?.id || seenIdsRef.current.has(notification.id)) return;
        seenIdsRef.current.add(notification.id);
        setNotifications((previous) => [notification, ...previous.filter((item) => item.id !== notification.id)]);
        showInfoToast(notification.title, notification.body);
      };

      socket.on('notification', acceptNotification);
      socket.on('realtime_notification', ({ userId, notification }: { userId: string; notification: AppNotification }) => {
        if (userId === user.id) acceptNotification(notification);
      });
      socket.on('class_created', (data: { name: string; subject: string; teacherName: string; joinCode: string }) => {
        if (user.role === 'student') {
          showSuccessToast(`New Class: ${data.name}`, `${data.teacherName} published ${data.subject}. Join with code: ${data.joinCode}`);
        }
      });
    }).catch(() => {});

    return () => {
      disposed = true;
      socket?.disconnect();
      if (socketRef.current === socket) socketRef.current = null;
    };
  }, [user, showInfoToast, showSuccessToast]);

  const markAsRead = async (id: string) => {
    try {
      await apiPatch(`/notifications/${encodeURIComponent(id)}/read`).catch(() => {});
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
      );
    } catch {
      // Ignore background errors
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiPatch('/notifications/read-all').catch(() => {});
      const now = new Date().toISOString();
      setNotifications((prev) => prev.map((n) => ({ ...n, read_at: now })));
    } catch {
      // Ignore background errors
    }
  };

  const openNotification = async (notification: AppNotification) => {
    if (!notification.read_at) {
      await markAsRead(notification.id);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        loadNotifications,
        markAsRead,
        markAllAsRead,
        openNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextValue => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

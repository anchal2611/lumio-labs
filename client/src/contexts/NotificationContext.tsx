import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { apiGet, apiPatch, getAuthToken } from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { config } from '../config/env';
import { subscribeToUserNotifications, subscribeToRealtimeClasses } from '../services/firebase';

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
  const toast = useToast();
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

  // 1. Socket.IO Real-Time Push Connection
  useEffect(() => {
    if (!user) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    const token = getAuthToken();
    if (!token) return;

    const socketUrl = config.socketUrl || 'http://localhost:5000';
    const socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });
    socketRef.current = socket;

    // Real-time user targeted notification
    socket.on('notification', (newNotif: AppNotification) => {
      if (!newNotif || !newNotif.id) return;
      if (seenIdsRef.current.has(newNotif.id)) return;
      seenIdsRef.current.add(newNotif.id);

      setNotifications((prev) => [newNotif, ...prev.filter((n) => n.id !== newNotif.id)]);
      toast.info(newNotif.title, newNotif.body);
    });

    // Real-time global notification broadcast event
    socket.on('realtime_notification', ({ userId, notification }: { userId: string; notification: AppNotification }) => {
      if (userId !== user.id) return;
      if (!notification || !notification.id || seenIdsRef.current.has(notification.id)) return;
      seenIdsRef.current.add(notification.id);

      setNotifications((prev) => [notification, ...prev.filter((n) => n.id !== notification.id)]);
      toast.info(notification.title, notification.body);
    });

    // Real-time class created broadcast
    socket.on('class_created', (data: { name: string; subject: string; teacherName: string; joinCode: string }) => {
      if (user.role === 'student') {
        toast.success(
          `New Class: ${data.name}`,
          `${data.teacherName} published ${data.subject}. Join with code: ${data.joinCode}`
        );
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user, toast]);

  // 2. Firebase Firestore Real-Time Database Connection
  useEffect(() => {
    if (!user?.id) return;

    // Listen to Firebase Firestore notifications
    const unsubNotifications = subscribeToUserNotifications(user.id, (fbNotif) => {
      if (!fbNotif || !fbNotif.id) return;
      if (seenIdsRef.current.has(fbNotif.id)) return;
      seenIdsRef.current.add(fbNotif.id);

      const formatted: AppNotification = {
        id: fbNotif.id,
        type: fbNotif.type || 'info',
        title: fbNotif.title || 'Notification',
        body: fbNotif.body || '',
        link: fbNotif.link || null,
        read_at: fbNotif.read_at || null,
        created_at: fbNotif.created_at || new Date().toISOString(),
      };

      setNotifications((prev) => [formatted, ...prev.filter((n) => n.id !== formatted.id)]);
      toast.info(formatted.title, formatted.body);
    });

    // Listen to Firebase Firestore classes
    const unsubClasses = subscribeToRealtimeClasses((fbClass) => {
      if (user.role === 'student' && fbClass?.name && fbClass?.teacher_id !== user.id) {
        // If class was created within the last 15 seconds, display banner
        const isRecent = fbClass.created_at && (Date.now() - new Date(fbClass.created_at).getTime() < 15000);
        if (isRecent) {
          toast.success(
            `New Class: ${fbClass.name}`,
            `${fbClass.teacher_name || 'Instructor'} published "${fbClass.name}". Code: ${fbClass.join_code}`
          );
        }
      }
    });

    return () => {
      unsubNotifications?.();
      unsubClasses?.();
    };
  }, [user, toast]);

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

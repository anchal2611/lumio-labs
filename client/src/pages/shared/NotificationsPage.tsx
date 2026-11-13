import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Loader2, MessageSquare, Sparkles, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useNotifications, AppNotification } from '../../contexts/NotificationContext';

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { notifications, loading, markAllAsRead, openNotification: markAsRead } = useNotifications();

  const handleOpenNotification = async (notification: AppNotification) => {
    await markAsRead(notification);
    if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold text-navy-900 sm:text-2xl">Real-Time Notifications</h1>
          </div>
          <p className="text-sm text-brand-muted">
            Live broadcasts: course releases, collaborative editing permissions, assignment evaluations, and class alerts.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          disabled={notifications.every((item) => item.read_at)}
          leftIcon={<CheckCheck className="h-3.5 w-3.5" />}
          onClick={() => void markAllAsRead()}
        >
          Mark all as read
        </Button>
      </header>

      {loading ? (
        <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-brand-muted">
          <Loader2 className="h-5 w-5 animate-spin" />
          Synchronizing notifications from Firebase & Server...
        </div>
      ) : notifications.length ? (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`border transition-all duration-200 ${
                notification.read_at ? 'border-slate-200/80 bg-white' : 'border-primary/40 bg-blue-50/40 shadow-xs'
              }`}
            >
              <button onClick={() => void handleOpenNotification(notification)} className="w-full text-left">
                <CardContent className="flex items-start gap-3.5 p-4">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                      notification.type === 'class_created'
                        ? 'bg-purple-100 text-purple-700'
                        : notification.type === 'collab_permission'
                        ? 'bg-blue-100 text-primary'
                        : notification.type === 'submission_graded'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}
                  >
                    {notification.type === 'class_created' ? (
                      <Sparkles className="h-4 w-4" />
                    ) : notification.type === 'collab_permission' ? (
                      <MessageSquare className="h-4 w-4" />
                    ) : (
                      <Bell className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="text-sm font-semibold text-navy-900">{notification.title}</h2>
                      <time className="shrink-0 text-[10px] text-slate-400">
                        {new Date(
                          notification.created_at + (notification.created_at.includes('Z') ? '' : 'Z')
                        ).toLocaleString()}
                      </time>
                    </div>
                    <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-brand-muted">
                      {notification.body}
                    </p>
                  </div>
                  {!notification.read_at && <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-primary animate-pulse" />}
                </CardContent>
              </button>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <Bell className="mx-auto mb-3 h-9 w-9 text-slate-300" />
          <h2 className="font-semibold text-navy-900">You’re all caught up</h2>
          <p className="mt-1 text-sm text-brand-muted">New class announcements and collaboration updates will pop up here in real time.</p>
        </div>
      )}
    </div>
  );
};

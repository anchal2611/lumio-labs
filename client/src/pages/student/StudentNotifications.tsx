import React, { useState } from 'react';
import { Bell, CheckCheck, Clock, Award, Users, AlertCircle } from 'lucide-react';
import { MOCK_NOTIFICATIONS } from '../../services/mockData';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../contexts/ToastContext';

export const StudentNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const toast = useToast();

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    toast.success('All Notifications Read');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-5 h-5 text-primary" />
            <h1 className="text-xl sm:text-2xl font-bold text-navy-900 tracking-tight">
              Notification Center
            </h1>
          </div>
          <p className="text-xs text-brand-muted">
            Evaluation updates, peer collaboration invites, and department deadlines
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          leftIcon={<CheckCheck className="w-3.5 h-3.5" />}
          onClick={handleMarkAllRead}
        >
          Mark all as read
        </Button>
      </div>

      <div className="space-y-3">
        {notifications.map((notif) => (
          <Card
            key={notif.id}
            className={`border transition-all ${
              !notif.isRead
                ? 'border-primary/40 bg-blue-50/20 shadow-2xs'
                : 'border-slate-200/80 bg-white'
            }`}
          >
            <CardContent className="p-4 flex items-start gap-3.5">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  notif.type === 'submission_graded'
                    ? 'bg-emerald-100 text-emerald-700'
                    : notif.type === 'collaboration_invite'
                    ? 'bg-blue-100 text-primary'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {notif.type === 'submission_graded' && <Award className="w-4 h-4" />}
                {notif.type === 'collaboration_invite' && <Users className="w-4 h-4" />}
                {notif.type === 'deadline_approaching' && <Clock className="w-4 h-4" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-navy-900">{notif.title}</h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(notif.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-brand-muted mt-1 leading-relaxed">{notif.message}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

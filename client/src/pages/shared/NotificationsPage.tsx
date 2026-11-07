import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Bell, CheckCheck, Loader2, MessageSquare, Sparkles } from 'lucide-react';
import { apiGet, apiPatch } from '../../services/api';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

type Notification = { id: string; type: string; title: string; body: string; link?: string | null; read_at?: string | null; created_at: string };

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    try { const data = await apiGet<{ notifications: Notification[] }>('/notifications?limit=100'); setNotifications(data.notifications || []); setError(''); }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not load notifications.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const markAllRead = async () => {
    setSaving(true); setError('');
    try { await apiPatch('/notifications/read-all'); setNotifications((current) => current.map((item) => ({ ...item, read_at: new Date().toISOString() }))); }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not mark notifications as read.'); }
    finally { setSaving(false); }
  };
  const openNotification = async (notification: Notification) => {
    if (!notification.read_at) {
      try { await apiPatch(`/notifications/${encodeURIComponent(notification.id)}/read`); setNotifications((current) => current.map((item) => item.id === notification.id ? { ...item, read_at: new Date().toISOString() } : item)); }
      catch (err) { setError(err instanceof Error ? err.message : 'Could not update notification.'); }
    }
    if (notification.link) navigate(notification.link);
  };

  return <div className="mx-auto max-w-4xl space-y-6">
    <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><div className="mb-1 flex items-center gap-2"><Bell className="h-5 w-5 text-primary" /><h1 className="text-xl font-bold text-navy-900 sm:text-2xl">Notifications</h1></div><p className="text-sm text-brand-muted">Messages, lab releases, account changes, and assignment updates for your account.</p></div><Button size="sm" variant="outline" disabled={saving || notifications.every((item) => item.read_at)} isLoading={saving} leftIcon={<CheckCheck className="h-3.5 w-3.5" />} onClick={() => void markAllRead()}>Mark all as read</Button></header>
    {error && <div role="alert" className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
    {loading ? <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-brand-muted"><Loader2 className="h-5 w-5 animate-spin" />Loading notifications…</div>
      : notifications.length ? <div className="space-y-3">{notifications.map((notification) => <Card key={notification.id} className={`border transition-colors ${notification.read_at ? 'border-slate-200/80 bg-white' : 'border-primary/30 bg-blue-50/30'}`}><button onClick={() => void openNotification(notification)} className="w-full text-left"><CardContent className="flex items-start gap-3.5 p-4"><div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${notification.type === 'message' ? 'bg-blue-100 text-primary' : notification.type === 'submission_graded' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{notification.type === 'message' ? <MessageSquare className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}</div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><h2 className="text-sm font-semibold text-navy-900">{notification.title}</h2><time className="shrink-0 text-[10px] text-slate-400">{new Date(notification.created_at + (notification.created_at.includes('Z') ? '' : 'Z')).toLocaleString()}</time></div><p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-brand-muted">{notification.body}</p></div>{!notification.read_at && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />}</CardContent></button></Card>)}</div>
      : <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center"><Bell className="mx-auto mb-3 h-9 w-9 text-slate-300" /><h2 className="font-semibold text-navy-900">You’re all caught up</h2><p className="mt-1 text-sm text-brand-muted">New messages and course updates will show here.</p></div>}
  </div>;
};

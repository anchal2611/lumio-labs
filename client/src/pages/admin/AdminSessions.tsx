import React, { useCallback, useEffect, useState } from 'react';
import { Activity, AlertCircle, Loader2 } from 'lucide-react';
import { apiGet } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

type Session = { id: string; name: string; host_name: string; host_role: string; language: string; type: string; created_at: string };

export const AdminSessions: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { const data = await apiGet<{ sessions: Session[] }>('/collab/sessions'); setSessions(data.sessions || []); }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not load active sessions.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); const timer = window.setInterval(() => void load(), 30_000); return () => window.clearInterval(timer); }, [load]);

  return <div className="space-y-6"><header><div className="mb-1 flex items-center gap-2"><Activity className="h-5 w-5 text-amber-600" /><h1 className="text-xl font-bold text-navy-900 sm:text-2xl">Active collaboration sessions</h1></div><p className="text-sm text-brand-muted">Active sessions reported by the collaboration service. Participant counts are not available in the API yet.</p></header>
    <Card className="overflow-hidden">{error && <div role="alert" className="m-4 flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
      <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Session</th><th className="px-5 py-3">Host</th><th className="px-5 py-3">Type</th><th className="px-5 py-3">Language</th><th className="px-5 py-3">Started</th><th className="px-5 py-3">Status</th></tr></thead><tbody className="divide-y divide-slate-100">
        {loading ? <tr><td colSpan={6} className="px-5 py-12 text-center text-brand-muted"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" />Loading sessions…</td></tr>
          : sessions.length === 0 ? <tr><td colSpan={6} className="px-5 py-12 text-center text-brand-muted">No active sessions.</td></tr>
          : sessions.map((session) => <tr key={session.id}><td className="px-5 py-3.5 font-medium text-navy-900">{session.name}</td><td className="px-5 py-3.5">{session.host_name} <span className="text-xs capitalize text-brand-muted">({session.host_role})</span></td><td className="px-5 py-3.5 capitalize">{session.type}</td><td className="px-5 py-3.5 uppercase">{session.language}</td><td className="px-5 py-3.5">{new Date(session.created_at).toLocaleString()}</td><td className="px-5 py-3.5"><Badge variant="success" size="sm">Active</Badge></td></tr>)}
      </tbody></table></div>
    </Card>
  </div>;
};

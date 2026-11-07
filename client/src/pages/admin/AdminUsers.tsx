import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, Search, ShieldCheck, Loader2 } from 'lucide-react';
import { apiGet, apiPatch } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

type InstituteUser = { id: string; name: string; email: string; role: 'student' | 'teacher' | 'admin'; status: 'active' | 'inactive' | 'suspended'; avatar?: string; created_at: string };

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<InstituteUser[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const loadUsers = useCallback(async () => {
    setLoading(true); setError('');
    try { const data = await apiGet<{ users: InstituteUser[] }>('/institutes/me/users?limit=100'); setUsers(data.users || []); }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not load institute users.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void loadUsers(); }, [loadUsers]);
  const filtered = useMemo(() => { const q = search.trim().toLowerCase(); return users.filter((u) => !q || `${u.name} ${u.email} ${u.role}`.toLowerCase().includes(q)); }, [users, search]);

  const toggleStatus = async (user: InstituteUser) => {
    if (user.role === 'admin') return;
    const status = user.status === 'active' ? 'suspended' : 'active';
    setSavingId(user.id); setError('');
    try { await apiPatch(`/admin/users/${user.id}/status`, { status }); setUsers((current) => current.map((item) => item.id === user.id ? { ...item, status } : item)); }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not update user.'); }
    finally { setSavingId(null); }
  };

  return <div className="space-y-6"><header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><div className="mb-1 flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-amber-600" /><h1 className="text-xl font-bold text-navy-900 sm:text-2xl">Institute user directory</h1></div><p className="text-sm text-brand-muted">Real student and faculty accounts for your institute.</p></div><div className="w-full sm:w-72"><Input placeholder="Search users…" leftIcon={<Search className="h-4 w-4" />} value={search} onChange={(e) => setSearch(e.target.value)} /></div></header>
    <Card className="overflow-hidden">{error && <div role="alert" className="m-4 flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
      <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">User</th><th className="px-5 py-3">Role</th><th className="px-5 py-3">Joined</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Action</th></tr></thead><tbody className="divide-y divide-slate-100">
        {loading ? <tr><td colSpan={5} className="px-5 py-12 text-center text-brand-muted"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" />Loading users…</td></tr>
          : filtered.length === 0 ? <tr><td colSpan={5} className="px-5 py-12 text-center text-brand-muted">{search ? 'No users match your search.' : 'No users have joined this institute yet.'}</td></tr>
          : filtered.map((user) => <tr key={user.id}><td className="px-5 py-3.5"><p className="font-medium text-navy-900">{user.name}</p><p className="text-xs text-brand-muted">{user.email}</p></td><td className="px-5 py-3.5"><Badge variant={user.role === 'admin' ? 'warning' : user.role === 'teacher' ? 'aqua' : 'primary'} size="sm" className="capitalize">{user.role}</Badge></td><td className="px-5 py-3.5">{new Date(user.created_at).toLocaleDateString()}</td><td className="px-5 py-3.5"><Badge variant={user.status === 'active' ? 'success' : 'warning'} size="sm">{user.status}</Badge></td><td className="px-5 py-3.5 text-right"><Button size="sm" variant="outline" disabled={user.role === 'admin' || savingId === user.id} onClick={() => void toggleStatus(user)}>{savingId === user.id ? 'Saving…' : user.status === 'active' ? 'Suspend' : 'Reactivate'}</Button></td></tr>)}
      </tbody></table></div>
    </Card>
  </div>;
};

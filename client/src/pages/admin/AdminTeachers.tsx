import React, { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Loader2, Users } from 'lucide-react';
import { apiGet, apiPatch } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

type Teacher = {
  id: string; name: string; email: string; status: 'active' | 'inactive' | 'suspended';
  created_at: string; designation?: string | null; department?: string | null; employee_id?: string | null;
};

export const AdminTeachers: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadTeachers = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const data = await apiGet<{ teachers: Teacher[] }>('/admin/teachers');
      setTeachers(data.teachers || []);
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not load faculty accounts.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void loadTeachers(); }, [loadTeachers]);

  const toggleStatus = async (teacher: Teacher) => {
    const status = teacher.status === 'active' ? 'suspended' : 'active';
    setUpdatingId(teacher.id); setError('');
    try {
      await apiPatch(`/admin/users/${teacher.id}/status`, { status });
      setTeachers((current) => current.map((item) => item.id === teacher.id ? { ...item, status } : item));
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not update faculty status.'); }
    finally { setUpdatingId(null); }
  };

  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-center gap-2 mb-1"><Users className="w-5 h-5 text-amber-600" /><h1 className="text-xl sm:text-2xl font-bold text-navy-900">Faculty accounts</h1></div>
        <p className="text-sm text-brand-muted">Teachers registered with your institute.</p>
      </header>
      <Card className="overflow-hidden">
        {error && <div role="alert" className="m-4 flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
        <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm">
          <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500"><tr>
            <th className="px-5 py-3">Faculty member</th><th className="px-5 py-3">Designation</th><th className="px-5 py-3">Department</th><th className="px-5 py-3">Status</th><th className="px-5 py-3 text-right">Action</th>
          </tr></thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? <tr><td colSpan={5} className="px-5 py-12 text-center text-brand-muted"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" />Loading faculty…</td></tr>
              : teachers.length === 0 ? <tr><td colSpan={5} className="px-5 py-12 text-center text-brand-muted">No teachers registered with this institute yet.</td></tr>
              : teachers.map((teacher) => <tr key={teacher.id} className="hover:bg-slate-50/70">
                <td className="px-5 py-3.5"><p className="font-medium text-navy-900">{teacher.name}</p><p className="mt-0.5 text-xs text-brand-muted">{teacher.email}</p></td>
                <td className="px-5 py-3.5 text-slate-700">{teacher.designation || '—'}</td><td className="px-5 py-3.5 text-slate-700">{teacher.department || '—'}</td>
                <td className="px-5 py-3.5"><Badge variant={teacher.status === 'active' ? 'success' : 'warning'} size="sm">{teacher.status}</Badge></td>
                <td className="px-5 py-3.5 text-right"><Button size="sm" variant="outline" disabled={updatingId === teacher.id} onClick={() => void toggleStatus(teacher)}>{updatingId === teacher.id ? 'Saving…' : teacher.status === 'active' ? 'Suspend' : 'Reactivate'}</Button></td>
              </tr>)}
          </tbody>
        </table></div>
      </Card>
    </div>
  );
};

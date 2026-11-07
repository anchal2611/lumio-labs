import React, { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Loader2, Plus, Users } from 'lucide-react';
import { apiGet, apiPatch, apiPost } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

type Teacher = {
  id: string; name: string; email: string; status: 'active' | 'inactive' | 'suspended';
  created_at: string; designation?: string | null; department?: string | null; employee_id?: string | null;
};
type TeacherForm = { name: string; email: string; password: string; designation: string; department: string; employeeId: string };

export const AdminTeachers: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [form, setForm] = useState<TeacherForm>({ name: '', email: '', password: '', designation: '', department: '', employeeId: '' });
  const [createdTeacherEmail, setCreatedTeacherEmail] = useState<string | null>(null);

  const loadTeachers = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const data = await apiGet<{ teachers: Teacher[] }>('/admin/teachers');
      setTeachers(data.teachers || []);
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not load faculty accounts.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void loadTeachers(); }, [loadTeachers]);

  const createTeacher = async (event: React.FormEvent) => {
    event.preventDefault(); setError(''); setSaving(true); setCreatedTeacherEmail(null);
    try {
      const result = await apiPost<{ teacher: Teacher }>('/admin/teachers', form);
      setCreatedTeacherEmail(result.teacher.email);
      setTeachers((current) => [result.teacher, ...current]);
      setForm({ name: '', email: '', password: '', designation: '', department: '', employeeId: '' });
      setFormOpen(false);
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not create the teacher account.'); }
    finally { setSaving(false); }
  };

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
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2"><Users className="h-5 w-5 text-amber-600" /><h1 className="text-xl font-bold text-navy-900 sm:text-2xl">Faculty accounts</h1></div>
          <p className="text-sm text-brand-muted">Create and manage teachers registered with your institute.</p>
        </div>
        <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => { setFormOpen((open) => !open); setError(''); }}>Add teacher</Button>
      </header>

      {error && <div role="alert" className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}

      {createdTeacherEmail && <Card role="status" className="border-emerald-200 bg-emerald-50/70 p-4">
        <h2 className="text-sm font-semibold text-emerald-900">Teacher account created</h2>
        <p className="mt-1 text-xs text-emerald-800">{createdTeacherEmail} can sign in with the password you set. Share it with the teacher through your usual secure channel.</p>
      </Card>}

      {formOpen && <Card className="p-4 sm:p-5">
        <h2 className="mb-4 text-sm font-semibold text-navy-900">Create teacher account</h2>
        <form onSubmit={createTeacher} className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-medium text-slate-700">Full name<input required maxLength={120} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" /></label>
          <label className="text-xs font-medium text-slate-700">Work email<input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" /></label>
          <label className="text-xs font-medium text-slate-700 sm:col-span-2">Initial password<input required type="password" minLength={8} maxLength={128} autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" /><span className="mt-1 block font-normal text-slate-500">Use at least 8 characters. The password is sent securely to the server and is never shown again after account creation.</span></label>
          <label className="text-xs font-medium text-slate-700">Designation<input maxLength={120} value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} placeholder="Assistant Professor" className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" /></label>
          <label className="text-xs font-medium text-slate-700">Department<input maxLength={120} value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} placeholder="Computer Science" className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" /></label>
          <label className="text-xs font-medium text-slate-700 sm:col-span-2">Employee ID (optional)<input maxLength={120} value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" /></label>
          <div className="flex gap-2 sm:col-span-2"><Button type="submit" size="sm" isLoading={saving}>Create account</Button><Button type="button" size="sm" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button></div>
        </form>
      </Card>}

      <Card className="overflow-hidden">
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

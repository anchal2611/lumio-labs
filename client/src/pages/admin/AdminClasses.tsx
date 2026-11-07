import React, { useCallback, useEffect, useState } from 'react';
import { AlertCircle, BookOpen, Loader2, Plus, Users } from 'lucide-react';
import { apiGet, apiPost } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

type ClassItem = { id: string; name: string; subject: string; description?: string | null; join_code: string; teacher_name: string; student_count: number; lab_count: number; created_at: string };
type Teacher = { id: string; name: string; email: string; status: string };

export const AdminClasses: React.FC = () => {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', subject: '', description: '', teacherId: '' });
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [classData, teacherData] = await Promise.all([apiGet<{ classes: ClassItem[] }>('/classes'), apiGet<{ teachers: Teacher[] }>('/admin/teachers')]);
      setClasses(classData.classes || []); setTeachers((teacherData.teachers || []).filter((teacher) => teacher.status === 'active'));
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not load institute classes.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const createClass = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setError('');
    try {
      await apiPost('/classes', form);
      setForm({ name: '', subject: '', description: '', teacherId: '' }); setOpen(false); await load();
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not create the class.'); }
    finally { setSaving(false); }
  };

  return <div className="space-y-6">
    <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><div className="mb-1 flex items-center gap-2"><BookOpen className="h-5 w-5 text-amber-600" /><h1 className="text-xl font-bold text-navy-900 sm:text-2xl">Institute classes</h1></div><p className="text-sm text-brand-muted">Set up classes and assign an active teacher before publishing labs.</p></div><Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => { setOpen((current) => !current); setError(''); }}>Add class</Button></header>
    {error && <div role="alert" className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
    {open && <Card className="p-4 sm:p-5"><h2 className="mb-4 text-sm font-semibold text-navy-900">Create institute class</h2>{teachers.length === 0 ? <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">Create an active teacher account first so the class has an instructor.</div> : <form onSubmit={createClass} className="grid gap-3 sm:grid-cols-2">
      <label className="text-xs font-medium text-slate-700">Class name<input required maxLength={120} value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal" /></label>
      <label className="text-xs font-medium text-slate-700">Subject<input required maxLength={120} value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal" /></label>
      <label className="text-xs font-medium text-slate-700">Instructor<select required value={form.teacherId} onChange={(event) => setForm({ ...form, teacherId: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal"><option value="">Choose teacher</option>{teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.name} · {teacher.email}</option>)}</select></label>
      <label className="text-xs font-medium text-slate-700">Description (optional)<input maxLength={1000} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal" /></label>
      <div className="flex gap-2 sm:col-span-2"><Button type="submit" size="sm" isLoading={saving}>Create class</Button><Button type="button" size="sm" variant="outline" onClick={() => setOpen(false)}>Cancel</Button></div>
    </form>}</Card>}
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{loading ? <Card className="p-12 text-center text-sm text-brand-muted md:col-span-2 xl:col-span-3"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" />Loading classes…</Card> : classes.length === 0 ? <Card className="p-12 text-center md:col-span-2 xl:col-span-3"><BookOpen className="mx-auto mb-3 h-8 w-8 text-slate-300" /><h2 className="font-semibold text-navy-900">No classes yet</h2><p className="mt-1 text-sm text-brand-muted">Create a teacher and class, then add labs for enrolled students.</p></Card> : classes.map((item) => <Card key={item.id} className="p-5"><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold text-navy-900">{item.name}</h2><p className="mt-1 text-xs text-brand-muted">{item.subject}</p></div><Badge variant="neutral" size="sm">{item.join_code}</Badge></div><p className="mt-4 text-xs text-slate-600">Instructor: {item.teacher_name || '—'}</p><div className="mt-4 flex items-center gap-4 border-t border-slate-100 pt-3 text-xs text-brand-muted"><span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" />{item.student_count} students</span><span>{item.lab_count} labs</span></div></Card>)}</div>
  </div>;
};

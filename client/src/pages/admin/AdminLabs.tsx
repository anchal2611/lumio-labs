import React, { useCallback, useEffect, useState } from 'react';
import { AlertCircle, FlaskConical, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { apiDelete, apiGet, apiPost, apiPut } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

type Exercise = { id?: string; order?: number; title: string; description?: string; starterCode?: string; expectedOutput?: string; hints?: string[]; points?: number };
type Lab = { id: string; title: string; description?: string; category: string; difficulty: string; language: string; class_id?: string | null; class_name?: string; teacher_name?: string; is_published: number; exercises: Exercise[] };
type ClassOption = { id: string; name: string; subject: string; teacher_name?: string };
type LabForm = { title: string; description: string; category: string; difficulty: string; language: string; classId: string; exerciseTitle: string; exerciseDescription: string; starterCode: string; expectedOutput: string };
const emptyForm: LabForm = { title: '', description: '', category: 'programming', difficulty: 'beginner', language: 'python', classId: '', exerciseTitle: 'First exercise', exerciseDescription: '', starterCode: 'print("Hello, world!")', expectedOutput: 'Hello, world!' };

export const AdminLabs: React.FC = () => {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Lab | null>(null);
  const [form, setForm] = useState<LabForm>(emptyForm);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [labData, classData] = await Promise.all([
        apiGet<{ labs: Lab[] }>('/labs'), apiGet<{ classes: ClassOption[] }>('/classes'),
      ]);
      setLabs(labData.labs || []); setClasses(classData.classes || []);
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not load institute labs.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const startCreate = () => { setEditing(null); setForm(emptyForm); setFormOpen(true); setError(''); };
  const startEdit = (lab: Lab) => {
    const first = lab.exercises?.[0];
    setEditing(lab);
    setForm({ title: lab.title, description: lab.description || '', category: lab.category, difficulty: lab.difficulty, language: lab.language, classId: lab.class_id || '', exerciseTitle: first?.title || 'First exercise', exerciseDescription: first?.description || '', starterCode: first?.starterCode || '', expectedOutput: first?.expectedOutput || '' });
    setFormOpen(true); setError('');
  };

  const saveLab = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setError('');
    const existingExercises = editing?.exercises || [];
    const exercise: Exercise = { ...(existingExercises[0] || {}), order: 1, title: form.exerciseTitle, description: form.exerciseDescription, starterCode: form.starterCode, expectedOutput: form.expectedOutput, hints: existingExercises[0]?.hints || [], points: existingExercises[0]?.points || 10 };
    const payload = { title: form.title, description: form.description, category: form.category, difficulty: form.difficulty, language: form.language, classId: form.classId, exercises: [exercise, ...existingExercises.slice(1)], isPublished: Boolean(editing?.is_published) };
    try {
      if (editing) await apiPut(`/labs/${editing.id}`, payload);
      else await apiPost('/labs', { ...payload, isPublished: false });
      setFormOpen(false); setEditing(null); await load();
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not save this lab.'); }
    finally { setSaving(false); }
  };

  const togglePublished = async (lab: Lab) => {
    setError('');
    try { await apiPut(`/labs/${lab.id}`, { isPublished: !lab.is_published }); await load(); }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not update lab visibility.'); }
  };

  const removeLab = async (lab: Lab) => {
    if (!window.confirm(`Delete “${lab.title}”?`)) return;
    setError('');
    try { await apiDelete(`/labs/${lab.id}`); setLabs((current) => current.filter((item) => item.id !== lab.id)); }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not delete this lab.'); }
  };

  return <div className="space-y-6">
    <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><div className="mb-1 flex items-center gap-2"><FlaskConical className="h-5 w-5 text-amber-600" /><h1 className="text-xl font-bold text-navy-900 sm:text-2xl">Institute laboratories</h1></div><p className="text-sm text-brand-muted">Create labs, assign them to a class, and control student visibility.</p></div><Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={startCreate}>Add lab</Button></header>
    {error && <div role="alert" className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
    {formOpen && <Card className="p-4 sm:p-5"><div className="mb-4 flex items-center justify-between"><h2 className="text-sm font-semibold text-navy-900">{editing ? 'Edit lab configuration' : 'Create lab'}</h2><Button size="sm" variant="ghost" onClick={() => setFormOpen(false)}>Close</Button></div>
      {classes.length === 0 ? <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">Create a class and assign it to this institute before adding a student lab. Labs need a class so enrolled students can see them.</div> : <form onSubmit={saveLab} className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs font-medium text-slate-700">Lab title<input required maxLength={160} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" /></label>
        <label className="text-xs font-medium text-slate-700">Class<select required value={form.classId} onChange={(e) => setForm({ ...form, classId: e.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"><option value="">Choose a class</option>{classes.map((cls) => <option key={cls.id} value={cls.id}>{cls.name} · {cls.subject}{cls.teacher_name ? ` · ${cls.teacher_name}` : ''}</option>)}</select></label>
        <label className="text-xs font-medium text-slate-700">Category<input maxLength={80} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" /></label>
        <label className="text-xs font-medium text-slate-700">Language<select value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">{['python', 'javascript', 'c', 'cpp', 'java', 'sql'].map((language) => <option key={language} value={language}>{language.toUpperCase()}</option>)}</select></label>
        <label className="text-xs font-medium text-slate-700">Difficulty<select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20">{['beginner', 'intermediate', 'advanced'].map((difficulty) => <option key={difficulty}>{difficulty}</option>)}</select></label>
        <label className="text-xs font-medium text-slate-700 sm:col-span-2">Description<textarea rows={2} maxLength={4000} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20" /></label>
        <div className="border-t border-slate-100 pt-3 sm:col-span-2"><h3 className="mb-3 text-xs font-semibold text-navy-900">First exercise</h3><div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs font-medium text-slate-700">Exercise title<input required maxLength={160} value={form.exerciseTitle} onChange={(e) => setForm({ ...form, exerciseTitle: e.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal" /></label>
          <label className="text-xs font-medium text-slate-700">Expected output<input value={form.expectedOutput} onChange={(e) => setForm({ ...form, expectedOutput: e.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm font-normal" /></label>
          <label className="text-xs font-medium text-slate-700 sm:col-span-2">Instructions<textarea rows={2} value={form.exerciseDescription} onChange={(e) => setForm({ ...form, exerciseDescription: e.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal" /></label>
          <label className="text-xs font-medium text-slate-700 sm:col-span-2">Starter code<textarea rows={5} value={form.starterCode} onChange={(e) => setForm({ ...form, starterCode: e.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-xs font-normal" /></label>
        </div></div>
        <div className="flex gap-2 sm:col-span-2"><Button type="submit" size="sm" isLoading={saving}>{editing ? 'Save changes' : 'Create draft lab'}</Button><Button type="button" size="sm" variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button></div>
      </form>}
    </Card>}
    <Card className="overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[860px] text-left text-sm"><thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Lab</th><th className="px-5 py-3">Class</th><th className="px-5 py-3">Language</th><th className="px-5 py-3">Teacher</th><th className="px-5 py-3">Exercises</th><th className="px-5 py-3">Visibility</th><th className="px-5 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">
      {loading ? <tr><td colSpan={7} className="px-5 py-12 text-center text-brand-muted"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" />Loading labs…</td></tr>
        : labs.length === 0 ? <tr><td colSpan={7} className="px-5 py-12 text-center text-brand-muted">No labs have been created by your institute yet. Add one and assign it to a class.</td></tr>
        : labs.map((lab) => <tr key={lab.id} className="hover:bg-slate-50/70"><td className="px-5 py-3.5"><p className="font-medium text-navy-900">{lab.title}</p><p className="mt-0.5 text-xs capitalize text-brand-muted">{lab.category} · {lab.difficulty}</p></td><td className="px-5 py-3.5 text-slate-700">{lab.class_name || classes.find((item) => item.id === lab.class_id)?.name || '—'}</td><td className="px-5 py-3.5 uppercase text-slate-700">{lab.language}</td><td className="px-5 py-3.5 text-slate-700">{lab.teacher_name || '—'}</td><td className="px-5 py-3.5 text-slate-700">{lab.exercises?.length || 0}</td><td className="px-5 py-3.5"><Badge variant={lab.is_published ? 'success' : 'warning'} size="sm">{lab.is_published ? 'Published' : 'Draft'}</Badge></td><td className="px-5 py-3.5"><div className="flex justify-end gap-1"><Button size="sm" variant="outline" leftIcon={<Pencil className="h-3.5 w-3.5" />} onClick={() => startEdit(lab)}>Edit</Button><Button size="sm" variant={lab.is_published ? 'outline' : 'primary'} onClick={() => void togglePublished(lab)}>{lab.is_published ? 'Unpublish' : 'Publish'}</Button><Button size="sm" variant="ghost" className="text-red-600" title="Delete lab" onClick={() => void removeLab(lab)}><Trash2 className="h-3.5 w-3.5" /></Button></div></td></tr>)}
    </tbody></table></div></Card>
  </div>;
};

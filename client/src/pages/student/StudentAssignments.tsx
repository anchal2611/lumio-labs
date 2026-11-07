import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Award, CheckCircle2, Clock, ClipboardList, FileCode, Loader2, Send } from 'lucide-react';
import { apiGet, apiPost } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';

interface Assignment {
  id: string; title: string; description?: string | null; class_name: string; lab_title: string;
  lab_module_id: string; due_date?: string | null; max_marks: number;
  submission_id?: string | null; submission_status?: string | null; marks?: number | null;
  submission_feedback?: string | null; submitted_at?: string | null;
}

export const StudentAssignments: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Assignment | null>(null);
  const [code, setCode] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { const data = await apiGet<{ assignments: Assignment[] }>('/assignments'); setAssignments(data.assignments || []); }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not load assignments.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const openSubmit = (assignment: Assignment) => { setSelected(assignment); setCode(''); setNotes(''); };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selected) return;
    setSaving(true); setError('');
    try {
      await apiPost(`/assignments/${encodeURIComponent(selected.id)}/submit`, { code, notes });
      toast.success('Assignment submitted', 'Your latest submission is available to your instructor.');
      setSelected(null); await load();
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not submit assignment.'); }
    finally { setSaving(false); }
  };

  return <div className="space-y-6">
    <header><div className="mb-1 flex items-center gap-2"><ClipboardList className="h-5 w-5 text-primary" /><h1 className="text-xl font-bold tracking-tight text-navy-900 sm:text-2xl">Practical assignments</h1></div><p className="text-sm text-brand-muted">Assignments from your enrolled classes, with instructor feedback and grades.</p></header>
    {error && !selected && <div role="alert" className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}<button className="ml-auto underline" onClick={() => void load()}>Retry</button></div>}
    {loading ? <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-brand-muted"><Loader2 className="h-5 w-5 animate-spin" />Loading assignments…</div>
      : assignments.length ? <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">{assignments.map((assignment) => {
        const graded = assignment.submission_status === 'graded';
        const submitted = Boolean(assignment.submission_id);
        return <Card key={assignment.id} className="flex flex-col border border-slate-200/80"><CardContent className="flex flex-1 flex-col p-5">
          <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold text-primary">{assignment.class_name}</p><h2 className="mt-1 text-base font-bold text-navy-900">{assignment.title}</h2></div><Badge variant={graded ? 'success' : submitted ? 'warning' : 'neutral'} size="sm">{graded ? 'Graded' : submitted ? 'Submitted' : 'Not submitted'}</Badge></div>
          <p className="mt-2 text-sm text-brand-muted">{assignment.description || 'Complete the assigned lab and submit your code for review.'}</p>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100 pt-3 text-xs text-slate-500"><span className="inline-flex items-center gap-1"><FileCode className="h-3.5 w-3.5" />{assignment.lab_title}</span><span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{assignment.due_date ? `Due ${new Date(assignment.due_date).toLocaleDateString()}` : 'No due date'}</span><span>Max {assignment.max_marks} marks</span></div>
          {graded && <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm"><p className="flex items-center gap-1.5 font-semibold text-emerald-900"><Award className="h-4 w-4" />Score: {assignment.marks} / {assignment.max_marks}</p>{assignment.submission_feedback && <p className="mt-1 text-emerald-800">{assignment.submission_feedback}</p>}</div>}
          {submitted && !graded && <p className="mt-3 flex items-center gap-1.5 text-xs text-amber-700"><CheckCircle2 className="h-3.5 w-3.5" />Submitted {assignment.submitted_at ? new Date(assignment.submitted_at).toLocaleString() : ''} · awaiting review</p>}
          <div className="mt-auto flex justify-end gap-2 pt-5"><Button size="sm" variant="outline" onClick={() => navigate(`/student/labs/${encodeURIComponent(assignment.lab_module_id)}`)}>Open lab</Button><Button size="sm" onClick={() => openSubmit(assignment)} leftIcon={<Send className="h-3.5 w-3.5" />}>{submitted ? 'Update submission' : 'Submit code'}</Button></div>
        </CardContent></Card>;
      })}</div> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"><ClipboardList className="mx-auto mb-3 h-10 w-10 text-slate-300" /><h2 className="font-semibold text-navy-900">No assignments yet</h2><p className="mt-1 text-sm text-brand-muted">Assignments for classes you join will appear here.</p></div>}

    {selected && <Modal isOpen onClose={() => setSelected(null)} title={`Submit: ${selected.title}`} description={`Submit code for ${selected.class_name}. Maximum score: ${selected.max_marks} marks.`} maxWidth="2xl"><form onSubmit={submit} className="space-y-4">
      {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <label className="block"><span className="mb-1 block text-sm font-semibold text-navy-900">Code</span><textarea value={code} onChange={(event) => setCode(event.target.value)} rows={12} required maxLength={100000} spellCheck={false} className="w-full rounded-xl border border-slate-300 bg-navy-950 p-3 font-mono text-sm text-emerald-300 focus:border-primary focus:outline-none" placeholder="Paste your completed code here" /></label>
      <label className="block"><span className="mb-1 block text-sm font-semibold text-navy-900">Notes for instructor <span className="font-normal text-slate-500">(optional)</span></span><textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} maxLength={4000} className="w-full resize-y rounded-lg border border-slate-300 p-3 text-sm focus:border-primary focus:outline-none" placeholder="Explain your approach or include relevant test results" /></label>
      <div className="flex justify-end gap-2 border-t border-slate-100 pt-3"><Button type="button" size="sm" variant="outline" onClick={() => setSelected(null)}>Cancel</Button><Button type="submit" size="sm" disabled={saving}>{saving ? 'Submitting…' : 'Submit assignment'}</Button></div>
    </form></Modal>}
  </div>;
};

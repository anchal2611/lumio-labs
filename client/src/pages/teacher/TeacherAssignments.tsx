import React, { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Award, ClipboardList, Loader2, Plus } from 'lucide-react';
import { apiGet, apiPut } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { GradingDrawer } from '../../components/practicals/GradingDrawer';
import { AssignmentModal } from '../../components/practicals/AssignmentModal';
import { Submission } from '../../types/assignment';
import { useToast } from '../../contexts/ToastContext';

interface AssignmentRow { id: string; title: string; class_name: string; lab_title: string; due_date?: string | null; max_marks: number; submission_count: number; }
interface SubmissionRow extends Submission { assignmentId: string; }

export const TeacherAssignments: React.FC = () => {
  const toast = useToast();
  const [assignments, setAssignments] = useState<AssignmentRow[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [selected, setSelected] = useState<SubmissionRow | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const { assignments: rows } = await apiGet<{ assignments: AssignmentRow[] }>('/assignments');
      const list = rows || [];
      const submissionLists = await Promise.all(list.map(async (assignment) => {
        const data = await apiGet<{ submissions: Array<Record<string, any>> }>(`/assignments/${encodeURIComponent(assignment.id)}/submissions`);
        return (data.submissions || []).map((row): SubmissionRow => ({
          id: row.id, assignmentId: assignment.id, assignmentTitle: assignment.title,
          studentId: row.student_id, studentName: row.student_name || 'Student', studentEmail: row.student_email || '',
          studentRollNo: row.roll_number || '—', submittedAt: row.submitted_at, code: row.code || '', notes: row.notes || '',
          status: row.status === 'graded' ? 'graded' : 'pending', marksObtained: row.marks ?? undefined,
          maxMarks: assignment.max_marks, feedback: row.feedback || '', gradedAt: row.graded_at || undefined,
        }));
      }));
      setAssignments(list); setSubmissions(submissionLists.flat());
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not load assignments and submissions.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const saveGrade = async (marks: number, feedback: string) => {
    if (!selected) return;
    try {
      await apiPut(`/assignments/${encodeURIComponent(selected.assignmentId)}/submissions/${encodeURIComponent(selected.id)}/grade`, { marks, feedback });
      toast.success('Grade published', `Awarded ${marks}/${selected.maxMarks} to ${selected.studentName}.`);
      setSelected(null); await load();
    } catch (err) { toast.error('Could not publish grade', err instanceof Error ? err.message : 'Please try again.'); throw err; }
  };

  return <div className="space-y-6">
    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><div className="mb-1 flex items-center gap-2"><ClipboardList className="h-5 w-5 text-teal-600" /><h1 className="text-xl font-bold tracking-tight text-navy-900 sm:text-2xl">Assignments & grading</h1></div><p className="text-sm text-brand-muted">Create class assignments and review real student submissions.</p></div><Button size="sm" onClick={() => setShowCreateModal(true)} leftIcon={<Plus className="h-3.5 w-3.5" />}>Create assignment</Button></header>
    {error && <div role="alert" className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}<button className="ml-auto underline" onClick={() => void load()}>Retry</button></div>}
    <Card className="overflow-hidden border border-slate-200/80"><div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 p-4"><span className="text-xs font-bold uppercase tracking-wider text-navy-900">Student submissions ({submissions.length})</span><Button size="sm" variant="outline" onClick={() => void load()} disabled={loading}>Refresh</Button></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[760px] border-collapse text-left text-sm"><thead className="border-b border-slate-200 bg-slate-100/70 text-[11px] font-bold uppercase tracking-wider text-navy-900"><tr><th className="p-3.5">Student</th><th className="p-3.5">Roll number</th><th className="p-3.5">Assignment</th><th className="p-3.5">Submitted</th><th className="p-3.5">Status</th><th className="p-3.5">Score</th><th className="p-3.5 text-right">Action</th></tr></thead><tbody className="divide-y divide-slate-100">
        {loading ? <tr><td colSpan={7} className="p-10 text-center text-brand-muted"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" />Loading submissions…</td></tr>
          : submissions.length === 0 ? <tr><td colSpan={7} className="p-10 text-center text-brand-muted">No submissions have arrived yet. Assignments: {assignments.length}.</td></tr>
          : submissions.map((submission) => <tr key={submission.id} className="hover:bg-slate-50"><td className="p-3.5 font-semibold text-navy-900">{submission.studentName}</td><td className="p-3.5 font-mono text-slate-500">{submission.studentRollNo}</td><td className="p-3.5 text-slate-700">{submission.assignmentTitle}</td><td className="p-3.5 text-slate-500">{new Date(submission.submittedAt).toLocaleString()}</td><td className="p-3.5"><Badge variant={submission.status === 'graded' ? 'success' : 'warning'} size="sm">{submission.status === 'graded' ? 'Graded' : 'Needs review'}</Badge></td><td className="p-3.5 font-semibold text-navy-900">{submission.marksObtained !== undefined ? `${submission.marksObtained} / ${submission.maxMarks}` : '—'}</td><td className="p-3.5 text-right"><Button size="sm" variant={submission.status === 'graded' ? 'outline' : 'primary'} leftIcon={<Award className="h-3.5 w-3.5" />} onClick={() => setSelected(submission)}>{submission.status === 'graded' ? 'Review grade' : 'Grade submission'}</Button></td></tr>)}
      </tbody></table></div>
    </Card>
    {selected && <GradingDrawer submission={selected} onClose={() => setSelected(null)} onSaveGrade={saveGrade} />}
    <AssignmentModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onCreated={() => void load()} />
  </div>;
};

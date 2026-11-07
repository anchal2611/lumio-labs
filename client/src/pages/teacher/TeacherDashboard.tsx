import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiGet } from '../../services/api';
import { ArrowRight, BookOpen, ClipboardList, FlaskConical, GraduationCap, Loader2, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

type ClassItem = { id: string; name: string; subject: string; student_count: number };
type Lab = { id: string; title: string; description?: string; language: string; is_published: number; exercises?: unknown[] };
type Assignment = { id: string; title: string; class_name: string; submission_count: number; due_date?: string | null };
type Submission = { id: string; student_name: string; student_email: string; roll_number?: string | null; status: string; submitted_at: string };

export const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [classResult, labResult, assignmentResult] = await Promise.all([
          apiGet<{ classes: ClassItem[] }>('/classes'), apiGet<{ labs: Lab[] }>('/labs'), apiGet<{ assignments: Assignment[] }>('/assignments'),
        ]);
        const assignmentSubmissions = await Promise.all((assignmentResult.assignments || []).map((a) => apiGet<{ submissions: Submission[] }>(`/assignments/${a.id}/submissions`)));
        if (!alive) return;
        setClasses(classResult.classes || []); setLabs(labResult.labs || []); setAssignments(assignmentResult.assignments || []);
        setSubmissions(assignmentSubmissions.flatMap((item) => item.submissions || []));
      } catch (err) { if (alive) setError(err instanceof Error ? err.message : 'Could not load teaching overview.'); }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, []);

  const studentsCount = classes.reduce((sum, item) => sum + (item.student_count || 0), 0);
  const pending = submissions.filter((item) => item.status !== 'graded');
  return <div className="space-y-7">
    <section className="flex flex-col gap-5 rounded-2xl bg-gradient-to-r from-navy-950 via-navy-900 to-teal-900 p-6 text-white shadow-floating sm:p-8 md:flex-row md:items-center md:justify-between"><div><Badge variant="aqua" size="sm">Faculty workspace</Badge><h1 className="mt-3 text-2xl font-bold sm:text-3xl">Welcome, {user?.name || 'Teacher'}</h1><p className="mt-2 text-sm text-slate-300">Manage your classes, lab modules and student submissions.</p><div className="mt-5 flex flex-wrap gap-3"><Button size="sm" variant="accent" leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={() => navigate('/teacher/labs/new')}>Create lab</Button><Button size="sm" variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20" onClick={() => navigate('/teacher/classes')}>Manage classes</Button></div></div></section>
    {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
    <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">{[{ label: 'Classes', value: classes.length, icon: BookOpen }, { label: 'Enrolled students', value: studentsCount, icon: GraduationCap }, { label: 'Lab modules', value: labs.length, icon: FlaskConical }, { label: 'To grade', value: pending.length, icon: ClipboardList }].map(({ label, value, icon: Icon }) => <Card key={label}><CardContent className="flex items-center gap-3 p-4"><Icon className="h-5 w-5 shrink-0 text-primary" /><div><p className="text-xs text-brand-muted">{label}</p><p className="text-lg font-semibold text-navy-900">{loading ? '—' : value}</p></div></CardContent></Card>)}</section>
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2"><Card><CardHeader className="flex flex-row items-center justify-between"><div><CardTitle>My lab modules</CardTitle><p className="mt-1 text-sm text-brand-muted">Labs created by your account.</p></div><Button size="sm" variant="outline" onClick={() => navigate('/teacher/labs')}>View labs</Button></CardHeader><CardContent className="space-y-3">{loading ? <p className="py-5 text-center text-sm text-brand-muted"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" />Loading labs…</p> : labs.length === 0 ? <p className="py-6 text-center text-sm text-brand-muted">You have not created a lab yet.</p> : labs.slice(0, 4).map((lab) => <div key={lab.id} className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4"><span><span className="block font-medium text-navy-900">{lab.title}</span><span className="mt-1 block text-xs text-brand-muted">{lab.language.toUpperCase()} · {lab.exercises?.length || 0} exercises</span></span><Badge variant={lab.is_published ? 'success' : 'warning'} size="sm">{lab.is_published ? 'Published' : 'Draft'}</Badge></div>)}</CardContent></Card>
    <Card><CardHeader className="flex flex-row items-center justify-between"><div><CardTitle>Assignments</CardTitle><p className="mt-1 text-sm text-brand-muted">Submission counts from your classes.</p></div><Button size="sm" variant="outline" rightIcon={<ArrowRight className="h-3 w-3" />} onClick={() => navigate('/teacher/assignments')}>View all</Button></CardHeader><CardContent className="space-y-3">{loading ? <p className="py-5 text-center text-sm text-brand-muted"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" />Loading assignments…</p> : assignments.length === 0 ? <p className="py-6 text-center text-sm text-brand-muted">No assignments have been created yet.</p> : assignments.slice(0, 4).map((assignment) => <div key={assignment.id} className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4"><span><span className="block font-medium text-navy-900">{assignment.title}</span><span className="mt-1 block text-xs text-brand-muted">{assignment.class_name} · Due {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString() : 'not set'}</span></span><Badge variant="aqua" size="sm">{assignment.submission_count} submissions</Badge></div>)}</CardContent></Card></div>
  </div>;
};

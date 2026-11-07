import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiGet } from '../../services/api';
import { ArrowRight, BookOpen, ClipboardList, FlaskConical, Loader2, Users2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

type Lab = { id: string; title: string; description?: string; language: string; exercises?: unknown[]; teacher_name?: string };
type Assignment = { id: string; title: string; description?: string; class_name: string; lab_title: string; due_date?: string | null; submission_status?: string | null; marks?: number | null; max_marks: number };
type Session = { id: string; name: string; language: string; host_name: string; type: string };
type ClassItem = { id: string; name: string };

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [labs, setLabs] = useState<Lab[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [classCount, setClassCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    Promise.allSettled([
      apiGet<{ labs: Lab[] }>('/labs'),
      apiGet<{ assignments: Assignment[] }>('/assignments'),
      apiGet<{ sessions: Session[] }>('/collab/sessions'),
      apiGet<{ classes: ClassItem[] }>('/classes'),
    ]).then((results) => {
      if (!alive) return;
      const errors: string[] = [];
      if (results[0].status === 'fulfilled') setLabs(results[0].value.labs || []); else errors.push(results[0].reason?.message || 'Labs unavailable');
      if (results[1].status === 'fulfilled') setAssignments(results[1].value.assignments || []); else errors.push(results[1].reason?.message || 'Assignments unavailable');
      if (results[2].status === 'fulfilled') setSessions(results[2].value.sessions || []); else errors.push(results[2].reason?.message || 'Sessions unavailable');
      if (results[3].status === 'fulfilled') setClassCount(results[3].value.classes?.length || 0); else errors.push(results[3].reason?.message || 'Classes unavailable');
      if (errors.length) setError(errors.join(' · '));
    }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const pendingAssignments = assignments.filter((item) => item.submission_status !== 'graded');
  return <div className="space-y-7">
    <section className="flex flex-col gap-5 rounded-2xl bg-gradient-to-r from-navy-900 via-navy-800 to-primary-dark p-6 text-white shadow-floating sm:p-8 md:flex-row md:items-center md:justify-between">
      <div><Badge variant="aqua" size="sm">{user?.department || 'Student workspace'}</Badge><h1 className="mt-3 text-2xl font-bold sm:text-3xl">Welcome, {user?.name || 'Student'}</h1><p className="mt-2 max-w-2xl text-sm text-slate-300">Your enrolled labs, coursework and active collaboration sessions.</p>
        <div className="mt-5 flex flex-wrap gap-3"><Button size="sm" variant="accent" onClick={() => navigate(labs[0] ? `/student/labs/${labs[0].id}` : '/student/classes')}>{labs[0] ? 'Open a lab' : 'Browse my classes'}</Button><Button size="sm" variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20" onClick={() => navigate('/student/collaboration')}>Study room</Button></div>
      </div>
      <div className="hidden min-w-40 text-right md:block"><p className="text-3xl font-bold">{user?.semester ? `S${user.semester}` : 'LUMIO'}</p><p className="text-xs text-slate-300">{user?.rollNumber || 'Learning workspace'}</p></div>
    </section>

    {error && <div role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">Some dashboard data could not be loaded: {error}</div>}
    <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {[{ label: 'Available labs', value: labs.length, icon: FlaskConical }, { label: 'Pending coursework', value: pendingAssignments.length, icon: ClipboardList }, { label: 'Active sessions', value: sessions.length, icon: Users2 }, { label: 'My classes', value: classCount, icon: BookOpen }].map(({ label, value, icon: Icon }) => <Card key={label}><CardContent className="flex items-center gap-3 p-4"><Icon className="h-5 w-5 shrink-0 text-primary" /><div><p className="text-xs text-brand-muted">{label}</p><p className="font-semibold text-navy-900">{value}</p></div></CardContent></Card>)}
    </section>

    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <Card><CardHeader className="flex flex-row items-center justify-between"><div><CardTitle>My lab modules</CardTitle><p className="mt-1 text-sm text-brand-muted">Published labs from your enrolled classes.</p></div><Button size="sm" variant="outline" rightIcon={<ArrowRight className="h-3.5 w-3.5" />} onClick={() => navigate('/student/labs')}>All labs</Button></CardHeader><CardContent className="space-y-3">
        {loading ? <p className="py-6 text-center text-sm text-brand-muted"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" />Loading labs…</p> : labs.length === 0 ? <div className="py-6 text-center"><p className="font-medium text-navy-900">No assigned labs yet</p><p className="mt-1 text-sm text-brand-muted">Join a class or ask your teacher to publish a lab.</p><Button className="mt-3" size="sm" variant="outline" onClick={() => navigate('/student/classes')}>View classes</Button></div> : labs.slice(0, 5).map((lab) => <button key={lab.id} onClick={() => navigate(`/student/labs/${lab.id}`)} className="flex w-full items-center justify-between gap-4 rounded-xl border border-slate-200 p-4 text-left transition hover:border-primary/40 hover:bg-slate-50"><span><span className="block font-medium text-navy-900">{lab.title}</span><span className="mt-1 block text-xs text-brand-muted">{lab.language.toUpperCase()} · {lab.exercises?.length || 0} exercises · {lab.teacher_name || 'Course faculty'}</span></span><ArrowRight className="h-4 w-4 shrink-0 text-primary" /></button>)}
      </CardContent></Card>

      <Card><CardHeader className="flex flex-row items-center justify-between"><div><CardTitle>Coursework</CardTitle><p className="mt-1 text-sm text-brand-muted">Submission and grading status.</p></div><Button size="sm" variant="outline" onClick={() => navigate('/student/assignments')}>All assignments</Button></CardHeader><CardContent className="space-y-3">
        {loading ? <p className="py-6 text-center text-sm text-brand-muted"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" />Loading coursework…</p> : assignments.length === 0 ? <p className="py-8 text-center text-sm text-brand-muted">No assignments from your classes yet.</p> : assignments.slice(0, 5).map((assignment) => <div key={assignment.id} className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-4"><span><span className="block font-medium text-navy-900">{assignment.title}</span><span className="mt-1 block text-xs text-brand-muted">{assignment.class_name} · {assignment.lab_title}</span></span><Badge variant={assignment.submission_status === 'graded' ? 'success' : assignment.submission_status ? 'warning' : 'neutral'} size="sm">{assignment.submission_status || 'Not submitted'}</Badge></div>)}
      </CardContent></Card>
    </div>
  </div>;
};

import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, GraduationCap, Loader2, Search } from 'lucide-react';
import { apiGet } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

type ClassItem = { id: string; name: string };
type Student = { id: string; name: string; email: string; roll_number?: string | null; branch?: string | null; semester?: number | null };

export const TeacherStudents: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { classes } = await apiGet<{ classes: ClassItem[] }>('/classes');
        const rosters = await Promise.all((classes || []).map((cls) => apiGet<{ students: Student[] }>(`/classes/${cls.id}/students`)));
        const unique = new Map<string, Student>();
        rosters.flatMap((roster) => roster.students || []).forEach((student) => unique.set(student.id, student));
        if (alive) setStudents([...unique.values()]);
      } catch (err) { if (alive) setError(err instanceof Error ? err.message : 'Could not load students.'); }
      finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, []);
  const filtered = useMemo(() => { const q = search.trim().toLowerCase(); return students.filter((s) => !q || `${s.name} ${s.email} ${s.roll_number || ''}`.toLowerCase().includes(q)); }, [students, search]);

  return <div className="space-y-6"><header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><div className="mb-1 flex items-center gap-2"><GraduationCap className="h-5 w-5 text-teal-600" /><h1 className="text-xl font-bold text-navy-900 sm:text-2xl">My class students</h1></div><p className="text-sm text-brand-muted">Students enrolled in your classes.</p></div><label className="relative block w-full sm:w-72"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search students…" className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-primary" /></label></header>
    <Card className="overflow-hidden">{error && <div role="alert" className="m-4 flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
      <div className="overflow-x-auto"><table className="w-full min-w-[600px] text-left text-sm"><thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Student</th><th className="px-5 py-3">Roll number</th><th className="px-5 py-3">Program</th><th className="px-5 py-3">Semester</th><th className="px-5 py-3">Status</th></tr></thead><tbody className="divide-y divide-slate-100">
        {loading ? <tr><td colSpan={5} className="px-5 py-12 text-center text-brand-muted"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" />Loading students…</td></tr>
          : filtered.length === 0 ? <tr><td colSpan={5} className="px-5 py-12 text-center text-brand-muted">{search ? 'No students match your search.' : 'No students are enrolled in your classes yet.'}</td></tr>
          : filtered.map((student) => <tr key={student.id}><td className="px-5 py-3.5"><p className="font-medium text-navy-900">{student.name}</p><p className="text-xs text-brand-muted">{student.email}</p></td><td className="px-5 py-3.5">{student.roll_number || '—'}</td><td className="px-5 py-3.5">{student.branch || '—'}</td><td className="px-5 py-3.5">{student.semester ? `Semester ${student.semester}` : '—'}</td><td className="px-5 py-3.5"><Badge variant="success" size="sm">Enrolled</Badge></td></tr>)}
      </tbody></table></div>
    </Card>
  </div>;
};

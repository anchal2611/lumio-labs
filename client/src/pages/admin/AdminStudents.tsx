import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, GraduationCap, Loader2, Search, UserRound } from 'lucide-react';
import { apiGet, apiPatch } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

type Student = {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  roll_number: string | null;
  branch: string | null;
  semester: number | null;
  department: string | null;
};

export const AdminStudents: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiGet<{ students: Student[] }>('/admin/students');
      setStudents(data.students || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load student accounts.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadStudents(); }, [loadStudents]);

  const filteredStudents = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return students;
    return students.filter((student) => [
      student.name, student.email, student.roll_number, student.department, student.branch,
    ].some((value) => value?.toLowerCase().includes(needle)));
  }, [query, students]);

  const toggleStatus = async (student: Student) => {
    const status = student.status === 'active' ? 'inactive' : 'active';
    setUpdatingId(student.id);
    setError('');
    try {
      await apiPatch(`/admin/users/${student.id}/status`, { status });
      setStudents((current) => current.map((item) => item.id === student.id ? { ...item, status } : item));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update student status.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap className="w-5 h-5 text-primary" />
            <h1 className="text-xl sm:text-2xl font-semibold text-navy-900 tracking-tight">Student accounts</h1>
          </div>
          <p className="text-sm text-brand-muted">Manage students registered with your institute.</p>
        </div>
        <div className="text-sm text-brand-muted">
          <span className="font-semibold text-navy-900">{students.length}</span> {students.length === 1 ? 'student' : 'students'}
        </div>
      </header>

      <Card>
        <div className="p-4 border-b border-slate-100">
          <label className="relative block max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, email, roll number or department"
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-navy-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10"
            />
          </label>
        </div>

        {error && (
          <div role="alert" className="m-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Student</th>
                <th className="px-5 py-3">Roll number</th>
                <th className="px-5 py-3">Department</th>
                <th className="px-5 py-3">Semester</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-brand-muted"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" />Loading students…</td></tr>
              ) : filteredStudents.length === 0 ? (
                <tr><td colSpan={6} className="px-5 py-12 text-center">
                  <UserRound className="mx-auto mb-2 h-6 w-6 text-slate-300" />
                  <p className="font-medium text-navy-900">{query ? 'No matching students' : 'No students registered yet'}</p>
                  <p className="mt-1 text-sm text-brand-muted">{query ? 'Try a different search.' : 'Students who register with an approved email domain or join one of your classes will appear here.'}</p>
                </td></tr>
              ) : filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/70">
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-navy-900">{student.name}</p>
                    <p className="mt-0.5 text-xs text-brand-muted">{student.email}</p>
                  </td>
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-600">{student.roll_number || '—'}</td>
                  <td className="px-5 py-3.5 text-slate-700">{student.department || student.branch || '—'}</td>
                  <td className="px-5 py-3.5 text-slate-700">{student.semester ? `Semester ${student.semester}` : '—'}</td>
                  <td className="px-5 py-3.5">
                    <Badge variant={student.status === 'active' ? 'success' : 'warning'} size="sm">{student.status}</Badge>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Button size="sm" variant="outline" disabled={updatingId === student.id} onClick={() => void toggleStatus(student)}>
                      {updatingId === student.id ? 'Saving…' : student.status === 'active' ? 'Deactivate' : 'Activate'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

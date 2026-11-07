import React, { useCallback, useEffect, useState } from 'react';
import { AlertCircle, ClipboardList, Loader2 } from 'lucide-react';
import { apiGet } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

type Assignment = { id: string; title: string; description?: string; class_name: string; lab_title: string; due_date?: string | null; submission_count: number };

export const AdminAssignments: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { const data = await apiGet<{ assignments: Assignment[] }>('/assignments'); setAssignments(data.assignments || []); }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not load assignments.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  return <div className="space-y-6"><header><div className="mb-1 flex items-center gap-2"><ClipboardList className="h-5 w-5 text-amber-600" /><h1 className="text-xl font-bold text-navy-900 sm:text-2xl">Institute assignments</h1></div><p className="text-sm text-brand-muted">Assignments and submissions across your institute.</p></header>
    <Card className="overflow-hidden">{error && <div role="alert" className="m-4 flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
      <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Assignment</th><th className="px-5 py-3">Class</th><th className="px-5 py-3">Lab</th><th className="px-5 py-3">Due</th><th className="px-5 py-3">Submissions</th><th className="px-5 py-3">Status</th></tr></thead><tbody className="divide-y divide-slate-100">
        {loading ? <tr><td colSpan={6} className="px-5 py-12 text-center text-brand-muted"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" />Loading assignments…</td></tr>
          : assignments.length === 0 ? <tr><td colSpan={6} className="px-5 py-12 text-center text-brand-muted">No assignments have been created yet.</td></tr>
          : assignments.map((item) => <tr key={item.id}><td className="px-5 py-3.5 font-medium text-navy-900">{item.title}</td><td className="px-5 py-3.5">{item.class_name}</td><td className="px-5 py-3.5">{item.lab_title}</td><td className="px-5 py-3.5">{item.due_date ? new Date(item.due_date).toLocaleDateString() : 'No due date'}</td><td className="px-5 py-3.5">{item.submission_count}</td><td className="px-5 py-3.5"><Badge variant="aqua" size="sm">Live</Badge></td></tr>)}
      </tbody></table></div>
    </Card>
  </div>;
};

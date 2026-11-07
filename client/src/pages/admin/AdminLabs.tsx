import React, { useCallback, useEffect, useState } from 'react';
import { AlertCircle, FlaskConical, Loader2 } from 'lucide-react';
import { apiGet } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

type Lab = { id: string; title: string; category: string; language: string; teacher_name?: string; is_published: number; exercises?: unknown[] };

export const AdminLabs: React.FC = () => {
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const loadLabs = useCallback(async () => {
    setLoading(true); setError('');
    try { const data = await apiGet<{ labs: Lab[] }>('/labs'); setLabs(data.labs || []); }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not load institute labs.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void loadLabs(); }, [loadLabs]);

  return <div className="space-y-6">
    <header><div className="flex items-center gap-2 mb-1"><FlaskConical className="w-5 h-5 text-amber-600" /><h1 className="text-xl sm:text-2xl font-bold text-navy-900">Institute laboratories</h1></div><p className="text-sm text-brand-muted">Labs created by teachers in your institute.</p></header>
    <Card className="overflow-hidden">
      {error && <div role="alert" className="m-4 flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
      <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm">
        <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Lab</th><th className="px-5 py-3">Category</th><th className="px-5 py-3">Language</th><th className="px-5 py-3">Teacher</th><th className="px-5 py-3">Exercises</th><th className="px-5 py-3">Visibility</th></tr></thead>
        <tbody className="divide-y divide-slate-100">
          {loading ? <tr><td colSpan={6} className="px-5 py-12 text-center text-brand-muted"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" />Loading labs…</td></tr>
            : labs.length === 0 ? <tr><td colSpan={6} className="px-5 py-12 text-center text-brand-muted">No labs have been created by your institute yet.</td></tr>
            : labs.map((lab) => <tr key={lab.id} className="hover:bg-slate-50/70"><td className="px-5 py-3.5 font-medium text-navy-900">{lab.title}</td><td className="px-5 py-3.5 capitalize text-slate-700">{lab.category}</td><td className="px-5 py-3.5 uppercase text-slate-700">{lab.language}</td><td className="px-5 py-3.5 text-slate-700">{lab.teacher_name || '—'}</td><td className="px-5 py-3.5 text-slate-700">{lab.exercises?.length || 0}</td><td className="px-5 py-3.5"><Badge variant={lab.is_published ? 'success' : 'warning'} size="sm">{lab.is_published ? 'Published' : 'Draft'}</Badge></td></tr>)}
        </tbody>
      </table></div>
    </Card>
  </div>;
};

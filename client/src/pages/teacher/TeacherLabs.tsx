import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlaskConical, Plus, AlertCircle, Loader2 } from 'lucide-react';
import { apiGet } from '../../services/api';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

type Lab = { id: string; title: string; description?: string; category: string; language: string; is_published: number; exercises: unknown[] };

export const TeacherLabs: React.FC = () => {
  const navigate = useNavigate();
  const [labs, setLabs] = useState<Lab[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const loadLabs = useCallback(async () => {
    setLoading(true); setError('');
    try { const data = await apiGet<{ labs: Lab[] }>('/labs'); setLabs(data.labs || []); }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not load your labs.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void loadLabs(); }, [loadLabs]);

  return <div className="space-y-6">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><div className="mb-1 flex items-center gap-2"><FlaskConical className="h-5 w-5 text-teal-600" /><h1 className="text-xl font-bold text-navy-900 sm:text-2xl">My teaching laboratories</h1></div><p className="text-sm text-brand-muted">Create and publish practical modules for your classes.</p></div><Button size="sm" variant="accent" leftIcon={<Plus className="h-3.5 w-3.5" />} onClick={() => navigate('/teacher/labs/new')}>Create lab</Button></header>
    {error && <div role="alert" className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
    {loading ? <Card><CardContent className="py-14 text-center text-brand-muted"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" />Loading your labs…</CardContent></Card>
      : labs.length === 0 ? <Card><CardContent className="py-12 text-center"><FlaskConical className="mx-auto mb-3 h-8 w-8 text-slate-300" /><h2 className="font-semibold text-navy-900">No labs yet</h2><p className="mt-1 text-sm text-brand-muted">Create your first lab to get started.</p><Button className="mt-4" size="sm" onClick={() => navigate('/teacher/labs/new')}>Create lab</Button></CardContent></Card>
      : <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">{labs.map((lab) => <Card key={lab.id}><CardContent className="flex h-full flex-col p-5"><div className="mb-3 flex items-center justify-between gap-2"><Badge variant="aqua" size="sm" className="capitalize">{lab.category}</Badge><Badge variant={lab.is_published ? 'success' : 'warning'} size="sm">{lab.is_published ? 'Published' : 'Draft'}</Badge></div><h2 className="font-semibold text-navy-900">{lab.title}</h2><p className="mt-1 line-clamp-2 text-sm text-brand-muted">{lab.description || 'No description provided.'}</p><div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4 mt-4 text-xs text-slate-600"><span className="uppercase">{lab.language}</span><span>{lab.exercises?.length || 0} exercises</span></div></CardContent></Card>)}</div>}
  </div>;
};

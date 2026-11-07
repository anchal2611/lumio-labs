import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, FlaskConical, Loader2, Search } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { apiGet } from '../../services/api';

interface LabItem {
  id: string;
  title: string;
  description?: string | null;
  category: string;
  difficulty: string;
  language: string;
  teacher_name?: string;
  class_id?: string | null;
  class_name?: string | null;
  exercises?: unknown[];
}

export const StudentLabsExplore: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [labs, setLabs] = useState<LabItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    apiGet<{ labs: LabItem[] }>('/labs')
      .then((data) => { if (active) setLabs(Array.isArray(data.labs) ? data.labs : []); })
      .catch((err: unknown) => { if (active) setError(err instanceof Error ? err.message : 'Could not load your laboratories.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const categories = ['all', ...Array.from(new Set(labs.map((lab) => lab.category).filter(Boolean)))];
  const filteredLabs = useMemo(() => labs.filter((lab) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || [lab.title, lab.description || '', lab.language, lab.teacher_name || '', lab.class_name || '']
      .some((value) => value.toLowerCase().includes(query));
    return matchesSearch && (selectedCategory === 'all' || lab.category === selectedCategory);
  }), [labs, search, selectedCategory]);

  return <div className="space-y-6">
    <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <div className="mb-1 flex items-center gap-2"><FlaskConical className="h-5 w-5 text-primary" /><h1 className="text-xl font-bold tracking-tight text-navy-900 sm:text-2xl">My laboratories</h1></div>
        <p className="text-sm text-brand-muted">Published lab modules from classes you have joined.</p>
      </div>
      <div className="w-full md:w-80"><Input placeholder="Search labs, languages, classes…" leftIcon={<Search className="h-4 w-4" />} value={search} onChange={(event) => setSearch(event.target.value)} /></div>
    </header>

    {categories.length > 1 && <div className="flex gap-2 overflow-x-auto pb-1">{categories.map((category) => <button key={category} onClick={() => setSelectedCategory(category)} className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition-colors ${selectedCategory === category ? 'bg-navy-900 text-white' : 'border border-slate-200 bg-white text-brand-muted hover:bg-slate-50'}`}>{category === 'all' ? 'All labs' : category.replace(/_/g, ' ')}</button>)}</div>}

    {error && <div role="alert" className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
    {loading ? <div className="flex min-h-56 items-center justify-center gap-2 text-sm text-brand-muted"><Loader2 className="h-5 w-5 animate-spin" />Loading your labs…</div>
      : filteredLabs.length ? <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">{filteredLabs.map((lab) => <Card key={lab.id} hoverable onClick={() => navigate(`/student/labs/${encodeURIComponent(lab.id)}`)} className="flex cursor-pointer flex-col border border-slate-200/80">
        <CardContent className="flex flex-1 flex-col p-5">
          <div className="mb-3 flex items-center justify-between gap-2"><Badge variant="primary" size="sm" className="capitalize">{lab.language}</Badge><Badge variant="neutral" size="sm" className="capitalize">{lab.difficulty || 'beginner'}</Badge></div>
          <h2 className="text-base font-bold text-navy-900">{lab.title}</h2>
          <p className="mt-1 line-clamp-3 flex-1 text-sm text-brand-muted">{lab.description || 'Open this lab module to view its exercises and workspace.'}</p>
          <p className="mt-3 text-xs text-slate-500">{lab.class_name ? `Class: ${lab.class_name} · ` : ''}Faculty: {lab.teacher_name || 'Your instructor'}</p>
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3"><span className="text-xs text-brand-muted">{lab.exercises?.length || 0} exercises</span><Button size="sm" variant="primary">Open lab →</Button></div>
        </CardContent>
      </Card>)}</div>
      : <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center"><FlaskConical className="mx-auto mb-3 h-10 w-10 text-slate-300" /><h2 className="font-semibold text-navy-900">{search ? 'No matching labs' : 'No published labs yet'}</h2><p className="mx-auto mt-1 max-w-md text-sm text-brand-muted">{search ? 'Try a different search or clear the category filter.' : 'Join a class and ask your instructor to publish a lab module for it.'}</p></div>}
  </div>;
};

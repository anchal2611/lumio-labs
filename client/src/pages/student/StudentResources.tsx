import React, { useEffect, useMemo, useState } from 'react';
import { BookMarked, Download, ExternalLink, Loader2, Search } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { apiGet } from '../../services/api';

type Resource = { id: string; title: string; description: string; category: string; file_type: string; file_size: string; download_url: string; author_name: string; class_name?: string | null };
export const StudentResources: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => { apiGet<{ resources: Resource[] }>('/resources').then((data) => setResources(data.resources || [])).catch((err) => setError(err instanceof Error ? err.message : 'Could not load resources.')).finally(() => setLoading(false)); }, []);
  const filtered = useMemo(() => { const query = search.trim().toLowerCase(); return resources.filter((item) => !query || `${item.title} ${item.description} ${item.category} ${item.file_type}`.toLowerCase().includes(query)); }, [resources, search]);
  return <div className="space-y-6"><header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><div className="mb-1 flex items-center gap-2"><BookMarked className="h-5 w-5 text-primary" /><h1 className="text-xl font-bold text-navy-900 sm:text-2xl">Resource library</h1></div><p className="text-sm text-brand-muted">Files and reference links shared by your institute and classes.</p></div><div className="w-full sm:w-72"><Input placeholder="Search resources…" leftIcon={<Search className="h-4 w-4" />} value={search} onChange={(event) => setSearch(event.target.value)} /></div></header>
    {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
    {loading ? <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-brand-muted"><Loader2 className="h-5 w-5 animate-spin" />Loading shared resources…</div> : filtered.length ? <div className="grid gap-5 md:grid-cols-2">{filtered.map((resource) => <Card key={resource.id}><CardContent className="flex h-full flex-col p-5"><div className="flex items-center justify-between gap-2"><Badge variant="aqua" size="sm">{resource.file_type}</Badge><span className="text-[11px] text-slate-400">{resource.file_size}</span></div><h2 className="mt-3 text-sm font-bold text-navy-900">{resource.title}</h2><p className="mt-1 flex-1 text-sm leading-relaxed text-brand-muted">{resource.description || 'Shared learning resource.'}</p><p className="mt-3 text-xs text-slate-500">{resource.class_name ? `For ${resource.class_name} · ` : ''}Added by {resource.author_name}</p><a href={resource.download_url} target="_blank" rel="noreferrer" className="mt-4 inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-primary hover:bg-slate-50"><Download className="h-3.5 w-3.5" />Open resource <ExternalLink className="h-3 w-3" /></a></CardContent></Card>)}</div> : <Card className="border-dashed p-12 text-center"><BookMarked className="mx-auto mb-3 h-8 w-8 text-slate-300" /><h2 className="font-semibold text-navy-900">{search ? 'No matching resources' : 'No shared resources yet'}</h2><p className="mt-1 text-sm text-brand-muted">{search ? 'Try another search.' : 'Resources added by your institute will appear here.'}</p></Card>}
  </div>;
};

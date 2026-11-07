import React, { useEffect, useState } from 'react';
import { BookMarked, ExternalLink, Loader2 } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { apiGet } from '../../services/api';

type Resource = { id: string; title: string; description: string; category: string; file_type: string; file_size: string; download_url: string; author_name: string; class_name?: string | null };
export const TeacherResources: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => { apiGet<{ resources: Resource[] }>('/resources').then((data) => setResources(data.resources || [])).catch((err) => setError(err instanceof Error ? err.message : 'Could not load resources.')).finally(() => setLoading(false)); }, []);
  return <div className="space-y-6"><header><div className="mb-1 flex items-center gap-2"><BookMarked className="h-5 w-5 text-teal-600" /><h1 className="text-xl font-bold text-navy-900 sm:text-2xl">Institute resource library</h1></div><p className="text-sm text-brand-muted">Reference materials shared with your institute or assigned classes.</p></header>
    {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
    {loading ? <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-brand-muted"><Loader2 className="h-5 w-5 animate-spin" />Loading resources…</div> : resources.length ? <div className="grid gap-5 md:grid-cols-2">{resources.map((resource) => <Card key={resource.id}><CardContent className="p-5"><div className="flex items-center justify-between"><Badge variant="aqua" size="sm">{resource.file_type}</Badge><span className="text-[11px] text-slate-400">{resource.file_size}</span></div><h2 className="mt-3 text-sm font-bold text-navy-900">{resource.title}</h2><p className="mt-1 text-sm text-brand-muted">{resource.description}</p><p className="mt-3 text-xs text-slate-500">{resource.class_name ? `For ${resource.class_name} · ` : ''}Added by {resource.author_name}</p><a href={resource.download_url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">Open resource <ExternalLink className="h-3 w-3" /></a></CardContent></Card>)}</div> : <Card className="border-dashed p-12 text-center"><BookMarked className="mx-auto mb-3 h-8 w-8 text-slate-300" /><h2 className="font-semibold text-navy-900">No resources yet</h2><p className="mt-1 text-sm text-brand-muted">Institute resources will appear here when an administrator shares them.</p></Card>}
  </div>;
};

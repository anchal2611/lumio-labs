import React, { useCallback, useEffect, useState } from 'react';
import { AlertCircle, BookMarked, ExternalLink, Loader2, Plus, Trash2 } from 'lucide-react';
import { apiDelete, apiGet, apiPost } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

type Resource = { id: string; title: string; description: string; category: string; file_type: string; file_size: string; download_url: string; author_name: string; class_name?: string | null; created_at: string };
type ClassOption = { id: string; name: string; subject: string };
type Form = { title: string; description: string; category: string; fileType: string; fileSize: string; downloadUrl: string; classId: string };
const initialForm: Form = { title: '', description: '', category: 'reference', fileType: 'link', fileSize: '', downloadUrl: '', classId: '' };

export const AdminResources: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [form, setForm] = useState<Form>(initialForm);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [resourceData, classData] = await Promise.all([apiGet<{ resources: Resource[] }>('/resources'), apiGet<{ classes: ClassOption[] }>('/classes')]);
      setResources(resourceData.resources || []); setClasses(classData.classes || []);
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not load institute resources.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const create = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setError('');
    try { await apiPost('/resources', form); setForm(initialForm); setOpen(false); await load(); }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not add this resource.'); }
    finally { setSaving(false); }
  };
  const remove = async (resource: Resource) => {
    if (!window.confirm(`Remove “${resource.title}” from the resource library?`)) return;
    try { await apiDelete(`/resources/${encodeURIComponent(resource.id)}`); setResources((current) => current.filter((item) => item.id !== resource.id)); }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not remove this resource.'); }
  };

  return <div className="space-y-6">
    <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><div className="mb-1 flex items-center gap-2"><BookMarked className="h-5 w-5 text-amber-600" /><h1 className="text-xl font-bold text-navy-900 sm:text-2xl">Resource library</h1></div><p className="text-sm text-brand-muted">Manage links to institute learning resources and optionally target a class.</p></div><Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => { setOpen((current) => !current); setError(''); }}>Add resource</Button></header>
    {error && <div role="alert" className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
    {open && <Card className="p-4 sm:p-5"><h2 className="mb-4 text-sm font-semibold text-navy-900">Add a resource link</h2><form onSubmit={create} className="grid gap-3 sm:grid-cols-2">
      <label className="text-xs font-medium text-slate-700">Title<input required maxLength={160} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal" /></label>
      <label className="text-xs font-medium text-slate-700">Category<input maxLength={80} value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal" /></label>
      <label className="text-xs font-medium text-slate-700 sm:col-span-2">Hosted file URL<input required type="url" placeholder="https://… (for example, a Firebase Storage download link)" value={form.downloadUrl} onChange={(event) => setForm({ ...form, downloadUrl: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal" /><span className="mt-1 block text-[11px] text-brand-muted">Upload the file to Firebase Storage or another file host, then paste its HTTPS URL here.</span></label>
      <label className="text-xs font-medium text-slate-700">File type<input maxLength={30} placeholder="PDF, ZIP, dataset…" value={form.fileType} onChange={(event) => setForm({ ...form, fileType: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal" /></label>
      <label className="text-xs font-medium text-slate-700">File size (optional)<input maxLength={40} placeholder="2.4 MB" value={form.fileSize} onChange={(event) => setForm({ ...form, fileSize: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal" /></label>
      <label className="text-xs font-medium text-slate-700">Visible to<select value={form.classId} onChange={(event) => setForm({ ...form, classId: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal"><option value="">Entire institute</option>{classes.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.subject}</option>)}</select></label>
      <label className="text-xs font-medium text-slate-700">Description<textarea rows={2} maxLength={2000} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-normal" /></label>
      <div className="flex gap-2 sm:col-span-2"><Button type="submit" size="sm" isLoading={saving}>Add resource</Button><Button type="button" size="sm" variant="outline" onClick={() => setOpen(false)}>Cancel</Button></div>
    </form></Card>}
    <Card className="overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[820px] text-left text-sm"><thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Resource</th><th className="px-5 py-3">Category</th><th className="px-5 py-3">Type / size</th><th className="px-5 py-3">Visibility</th><th className="px-5 py-3">Added by</th><th className="px-5 py-3 text-right">Action</th></tr></thead><tbody className="divide-y divide-slate-100">
      {loading ? <tr><td colSpan={6} className="px-5 py-12 text-center text-brand-muted"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" />Loading resources…</td></tr>
        : resources.length === 0 ? <tr><td colSpan={6} className="px-5 py-12 text-center text-brand-muted">No shared resources yet. Add a hosted link and choose its audience.</td></tr>
        : resources.map((resource) => <tr key={resource.id} className="hover:bg-slate-50/70"><td className="px-5 py-3.5"><p className="font-medium text-navy-900">{resource.title}</p><p className="mt-0.5 max-w-md truncate text-xs text-brand-muted">{resource.description}</p></td><td className="px-5 py-3.5 capitalize">{resource.category}</td><td className="px-5 py-3.5"><Badge variant="aqua" size="sm">{resource.file_type}</Badge><span className="ml-2 text-xs text-slate-500">{resource.file_size || '—'}</span></td><td className="px-5 py-3.5">{resource.class_name || 'Entire institute'}</td><td className="px-5 py-3.5 text-slate-700">{resource.author_name}</td><td className="px-5 py-3.5"><div className="flex justify-end gap-2"><a href={resource.download_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-slate-50">Open <ExternalLink className="h-3 w-3" /></a><Button size="sm" variant="ghost" className="text-red-600" title="Remove resource" onClick={() => void remove(resource)}><Trash2 className="h-3.5 w-3.5" /></Button></div></td></tr>)}
    </tbody></table></div></Card>
  </div>;
};

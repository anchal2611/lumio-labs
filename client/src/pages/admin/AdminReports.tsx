import React, { useCallback, useEffect, useState } from 'react';
import { AlertCircle, Download, History, Loader2, Search } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { apiGet } from '../../services/api';

type AuditLog = { id: string; created_at: string; actor_email: string; action: string; entity_type: string; entity_id?: string | null; details: string; ip_address?: string | null };
type AuditResponse = { logs: AuditLog[]; page: number; limit: number; total: number; pages: number };
const csvCell = (value: unknown) => {
  const text = String(value ?? '');
  const safe = /^[\s]*[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
};

export const AdminReports: React.FC = () => {
  const [data, setData] = useState<AuditResponse>({ logs: [], page: 1, limit: 100, total: 0, pages: 0 });
  const [query, setQuery] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { const result = await apiGet<AuditResponse>(`/admin/audit-logs?page=${page}&limit=100&search=${encodeURIComponent(search)}`); setData(result); }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not load the audit history.'); }
    finally { setLoading(false); }
  }, [page, search]);
  useEffect(() => { void load(); }, [load]);

  const exportCsv = () => {
    const header = ['Timestamp', 'Action', 'Actor', 'Entity type', 'Entity ID', 'IP address', 'Details'];
    const rows = data.logs.map((log) => [log.created_at, log.action, log.actor_email, log.entity_type, log.entity_id, log.ip_address, log.details]);
    const csv = [header, ...rows].map((row) => row.map(csvCell).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = `lumio-audit-page-${data.page}.csv`; link.click(); URL.revokeObjectURL(url);
  };

  return <div className="space-y-6">
    <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><div className="mb-1 flex items-center gap-2"><History className="h-5 w-5 text-amber-600" /><h1 className="text-xl font-bold tracking-tight text-navy-900 sm:text-2xl">Audit logs</h1></div><p className="text-sm text-brand-muted">Recorded changes made in your institute: account, class, lab, and grading activity.</p></div><Button size="sm" variant="outline" disabled={!data.logs.length} leftIcon={<Download className="h-3.5 w-3.5" />} onClick={exportCsv}>Export visible rows</Button></header>
    {error && <div role="alert" className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
    <Card className="overflow-hidden">
      <form onSubmit={(event) => { event.preventDefault(); setPage(1); setSearch(query.trim()); }} className="flex gap-2 border-b border-slate-100 p-3"><div className="relative min-w-0 flex-1"><Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search actions, people, entities…" className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-xs outline-none focus:border-primary" /></div><Button type="submit" size="sm" variant="outline">Search</Button></form>
      <div className="overflow-x-auto"><table className="w-full min-w-[900px] border-collapse text-left text-xs"><thead className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold uppercase text-slate-500"><tr><th className="p-3.5">Timestamp</th><th className="p-3.5">Action</th><th className="p-3.5">Initiator</th><th className="p-3.5">Target</th><th className="p-3.5">IP address</th><th className="p-3.5">Details</th></tr></thead><tbody className="divide-y divide-slate-100">
        {loading ? <tr><td colSpan={6} className="p-12 text-center text-brand-muted"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" />Loading audit history…</td></tr>
          : data.logs.length === 0 ? <tr><td colSpan={6} className="p-12 text-center text-brand-muted">{search ? 'No audit entries match this search.' : 'No changes have been recorded yet.'}</td></tr>
          : data.logs.map((log) => <tr key={log.id} className="align-top hover:bg-slate-50"><td className="whitespace-nowrap p-3.5 text-slate-500">{new Date(log.created_at + (log.created_at.includes('Z') ? '' : 'Z')).toLocaleString()}</td><td className="p-3.5"><Badge variant="neutral" size="sm">{log.action}</Badge></td><td className="p-3.5 text-slate-700">{log.actor_email}</td><td className="p-3.5 text-slate-600"><span className="capitalize">{log.entity_type}</span>{log.entity_id ? <span className="block max-w-40 truncate font-mono text-[10px] text-slate-400" title={log.entity_id}>{log.entity_id}</span> : null}</td><td className="p-3.5 text-slate-400">{log.ip_address || '—'}</td><td className="max-w-lg p-3.5 text-slate-700">{log.details}</td></tr>)}
      </tbody></table></div>
      <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-brand-muted"><span>{data.total} recorded events{data.total ? ` · page ${data.page} of ${data.pages}` : ''}</span><div className="flex gap-2"><Button size="sm" variant="outline" disabled={page <= 1 || loading} onClick={() => setPage((current) => current - 1)}>Previous</Button><Button size="sm" variant="outline" disabled={page >= data.pages || loading} onClick={() => setPage((current) => current + 1)}>Next</Button></div></div>
    </Card>
  </div>;
};

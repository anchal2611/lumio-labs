import React, { useCallback, useEffect, useState } from 'react';
import { AlertCircle, CircleHelp, Database, Globe2, Loader2, Save, Settings, ShieldAlert, Wifi } from 'lucide-react';
import { apiGet, apiPut } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../contexts/ToastContext';

interface Institute { name: string; email_domains: string[]; }
interface Health { status: string; timestamp: string; version: string; firebaseAdminConfigured: boolean; codeExecutionConfigured: boolean; }

export const AdminSettings: React.FC = () => {
  const toast = useToast();
  const [institute, setInstitute] = useState<Institute | null>(null);
  const [domains, setDomains] = useState('');
  const [health, setHealth] = useState<Health | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [org, service] = await Promise.all([apiGet<Institute>('/institutes/me'), apiGet<Health>('/health')]);
      setInstitute(org); setDomains((org.email_domains || []).join('\n')); setHealth(service);
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not load institute settings.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const saveDomains = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setError('');
    const cleaned = [...new Set(domains.split(/[\s,;]+/).map((domain) => domain.trim().toLowerCase().replace(/^@/, '')).filter(Boolean))];
    try {
      const result = await apiPut<{ domains: string[] }>('/institutes/me/domains', { domains: cleaned });
      setInstitute((current) => current ? { ...current, email_domains: result.domains } : current);
      setDomains(result.domains.join('\n'));
      toast.success('Email domains updated', 'Matching student accounts are now linked to this institute.');
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not save email domains.'); }
    finally { setSaving(false); }
  };

  const serviceStatus = (configured: boolean) => <Badge variant={configured ? 'success' : 'warning'} size="sm">{configured ? 'Configured' : 'Needs setup'}</Badge>;

  return <div className="mx-auto max-w-4xl space-y-6">
    <header><div className="mb-1 flex items-center gap-2"><Settings className="h-5 w-5 text-amber-600" /><h1 className="text-xl font-bold tracking-tight text-navy-900 sm:text-2xl">Institute settings</h1></div><p className="text-sm text-brand-muted">Manage student account matching and check the services this deployment reports.</p></header>
    {error && <div role="alert" className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
    <Card className="border border-slate-200/80"><CardHeader><CardTitle className="flex items-center gap-2"><Globe2 className="h-4 w-4 text-primary" />{institute?.name || 'Student email domains'}</CardTitle><p className="text-sm text-brand-muted">Students who register with these domains are associated with your institute. Existing matching accounts are linked when you save.</p></CardHeader><CardContent><form onSubmit={saveDomains} className="space-y-3"><label htmlFor="domains" className="block text-sm font-medium text-navy-900">Approved email domains</label><textarea id="domains" value={domains} onChange={(event) => setDomains(event.target.value)} rows={4} maxLength={4000} className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-navy-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" placeholder={'university.edu\ncs.university.edu'} /><p className="text-xs text-brand-muted">Enter one per line. Do not include an @ symbol; domains already assigned to another institute are rejected.</p><div className="flex justify-end"><Button type="submit" size="sm" disabled={saving || loading}>{saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving…</> : <><Save className="mr-2 h-4 w-4" />Save domains</>}</Button></div></form></CardContent></Card>
    <Card className="border border-slate-200/80"><CardHeader><CardTitle className="flex items-center gap-2"><Wifi className="h-4 w-4 text-primary" />Deployment service status</CardTitle></CardHeader><CardContent>
      {loading ? <p className="py-4 text-sm text-brand-muted"><Loader2 className="mr-2 inline h-4 w-4 animate-spin" />Checking deployment…</p> : health ? <div className="divide-y divide-slate-100">
        <div className="flex items-center justify-between gap-4 py-3"><div><p className="font-medium text-navy-900">LUMIO API</p><p className="text-xs text-brand-muted">Version {health.version} · last checked {new Date(health.timestamp).toLocaleString()}</p></div><Badge variant={health.status === 'ok' ? 'success' : 'warning'} size="sm">{health.status === 'ok' ? 'Online' : 'Unavailable'}</Badge></div>
        <div className="flex items-center justify-between gap-4 py-3"><div><p className="font-medium text-navy-900">Firebase Admin SDK</p><p className="text-xs text-brand-muted">Required for server-side Firebase sign-in verification and faculty account provisioning.</p></div>{serviceStatus(health.firebaseAdminConfigured)}</div>
        <div className="flex items-center justify-between gap-4 py-3"><div><p className="font-medium text-navy-900">Code execution provider</p><p className="text-xs text-brand-muted">Production code execution requires a configured Judge0 API key.</p></div>{serviceStatus(health.codeExecutionConfigured)}</div>
        <div className="flex items-center gap-3 py-3"><Database className="h-4 w-4 shrink-0 text-amber-600" /><p className="text-xs text-brand-muted">Application records still use local SQLite. Render Free storage is ephemeral, so records can reset when the service restarts or redeploys.</p></div>
      </div> : <div className="flex items-center gap-2 py-4 text-sm text-amber-700"><CircleHelp className="h-4 w-4" />Service status could not be read.</div>}
    </CardContent></Card>
    <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900"><ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" /><p>Secret keys are configured in Render environment variables, not from this page. Never paste a Firebase service-account key into the browser.</p></div>
  </div>;
};

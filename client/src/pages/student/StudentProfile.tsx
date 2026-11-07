import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, Building2, Calendar, GraduationCap, Mail, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiGet } from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

type Lab = { id: string; title: string; language?: string | null };

const displayValue = (value?: string | number | null) => value === null || value === undefined || String(value).trim() === '' ? 'Not provided' : String(value);

export const StudentProfile: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [labs, setLabs] = useState<Lab[]>([]);
  const [labsLoaded, setLabsLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    void refreshUser();
    apiGet<{ labs: Lab[] }>('/labs')
      .then((result) => { if (active) setLabs(result.labs || []); })
      .catch(() => { if (active) setLabs([]); })
      .finally(() => { if (active) setLabsLoaded(true); });
    return () => { active = false; };
  }, [refreshUser]);

  const profile = user?.profile || {};
  const rollNumber = profile.rollNumber || user?.rollNumber;
  const branch = profile.branch || user?.branch;
  const department = profile.department || user?.department;
  const semester = profile.semester ?? user?.semester;
  const languages = useMemo(() => [...new Set(labs.map((lab) => lab.language?.trim()).filter((language): language is string => Boolean(language)))], [labs]);
  const joined = user?.createdAt || user?.joinedAt;
  const joinedLabel = joined && !Number.isNaN(Date.parse(joined))
    ? new Date(joined).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Not available';
  const initials = user?.name?.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'S';
  const statusVariant = user?.status === 'active' ? 'success' : user?.status === 'suspended' ? 'danger' : 'warning';

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <div className="mb-1 flex items-center gap-2">
          <User className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold tracking-tight text-navy-900 sm:text-2xl">Academic Profile</h1>
        </div>
        <p className="text-sm text-brand-muted">Your account and academic information.</p>
      </header>

      <Card className="border border-slate-200/80">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col items-center gap-5 border-b border-slate-100 pb-6 text-center sm:flex-row sm:items-start sm:text-left">
            {user?.avatar
              ? <img src={user.avatar} alt="" className="h-20 w-20 rounded-full object-cover ring-4 ring-primary/10" />
              : <div aria-hidden="true" className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-semibold text-primary ring-4 ring-primary/5">{initials}</div>}
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <h2 className="text-xl font-bold text-navy-900">{displayValue(user?.name)}</h2>
                <Badge variant={user?.isVerified ? 'success' : 'neutral'} size="sm">{user?.isVerified ? 'Verified account' : 'Account'}</Badge>
              </div>
              <p className="font-mono text-sm text-brand-muted">{displayValue(rollNumber)}</p>
              <p className="text-sm text-slate-600">{displayValue(department)}{semester !== null && semester !== undefined ? ` · Semester ${semester}` : ''}</p>
            </div>
          </div>

          <div className="grid gap-7 pt-6 sm:grid-cols-2">
            <section className="space-y-5" aria-label="Academic details">
              <CardHeader className="p-0"><CardTitle className="text-sm">Academic details</CardTitle></CardHeader>
              <div className="flex gap-3"><Building2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><div><p className="text-xs text-slate-500">Institute</p><p className="mt-0.5 text-sm font-medium text-navy-900">{displayValue(user?.institute?.name || user?.university)}</p></div></div>
              <div className="flex gap-3"><GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><div><p className="text-xs text-slate-500">Branch</p><p className="mt-0.5 text-sm font-medium text-navy-900">{displayValue(branch)}</p></div></div>
              <div className="flex gap-3"><BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><div><p className="text-xs text-slate-500">Semester</p><p className="mt-0.5 text-sm font-medium text-navy-900">{displayValue(semester)}</p></div></div>
            </section>

            <section className="space-y-5" aria-label="Account details">
              <CardHeader className="p-0"><CardTitle className="text-sm">Account details</CardTitle></CardHeader>
              <div className="flex gap-3"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><div className="min-w-0"><p className="text-xs text-slate-500">Email</p><p className="mt-0.5 break-all text-sm font-medium text-navy-900">{displayValue(user?.email)}</p></div></div>
              <div className="flex gap-3"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><div><p className="text-xs text-slate-500">Account status</p><Badge className="mt-1" variant={statusVariant} size="sm">{displayValue(user?.status)}</Badge></div></div>
              <div className="flex gap-3"><Calendar className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><div><p className="text-xs text-slate-500">Joined</p><p className="mt-0.5 text-sm font-medium text-navy-900">{joinedLabel}</p></div></div>
            </section>
          </div>

          <section className="mt-7 border-t border-slate-100 pt-5">
            <h3 className="text-xs font-medium text-slate-500">Languages in your published labs</h3>
            <p className="mt-1 text-sm font-medium text-navy-900">
              {!labsLoaded ? 'Loading lab availability…' : languages.length ? languages.map((language) => language.toUpperCase()).join(', ') : 'No published labs available'}
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
};

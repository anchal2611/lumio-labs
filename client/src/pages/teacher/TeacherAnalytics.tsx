import React, { useEffect, useState } from 'react';
import { BarChart3, BookOpen, ClipboardList, GraduationCap, Loader2, Users } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { apiGet } from '../../services/api';

type AnalyticsSummary = {
  class_count: number;
  student_count: number;
  assignment_count: number;
  submission_count: number;
  graded_count: number;
  average_score: number | null;
  on_time_count: number;
  due_date_submission_count: number;
};

type LabAnalytics = {
  id: string;
  title: string;
  assignment_count: number;
  submission_count: number;
  graded_count: number;
  average_score: number | null;
  on_time_count: number | null;
  due_date_submission_count: number | null;
};

const formatPercent = (value: number | null | undefined) =>
  value === null || value === undefined || !Number.isFinite(Number(value)) ? '—' : `${Number(value).toFixed(1)}%`;

export const TeacherAnalytics: React.FC = () => {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [labs, setLabs] = useState<LabAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    apiGet<{ summary: AnalyticsSummary; labs: LabAnalytics[] }>('/teacher/analytics')
      .then((data) => {
        if (!active) return;
        setSummary(data.summary);
        setLabs(data.labs || []);
      })
      .catch((reason) => {
        if (active) setError(reason instanceof Error ? reason.message : 'Could not load analytics.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const metrics = [
    { label: 'Classes', value: summary?.class_count, icon: BookOpen },
    { label: 'Students', value: summary?.student_count, icon: Users },
    { label: 'Assignments', value: summary?.assignment_count, icon: ClipboardList },
    { label: 'Submissions', value: summary?.submission_count, icon: GraduationCap },
  ];

  return (
    <div className="space-y-6">
      <header>
        <div className="mb-1 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-teal-600" />
          <h1 className="text-xl font-bold tracking-tight text-navy-900 sm:text-2xl">Class activity</h1>
        </div>
        <p className="text-sm text-brand-muted">Assignment submissions and grades from your classes.</p>
      </header>

      {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-3 p-4">
              <Icon className="h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="text-xs text-brand-muted">{label}</p>
                <p className="text-lg font-semibold text-navy-900">{loading ? '—' : value ?? 0}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {summary && summary.submission_count > 0 && (
        <div className="grid gap-3 sm:grid-cols-3">
          <Card><CardContent className="p-4"><p className="text-xs text-brand-muted">Average score</p><p className="mt-1 text-xl font-semibold text-navy-900">{formatPercent(summary.average_score)}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-brand-muted">Graded submissions</p><p className="mt-1 text-xl font-semibold text-navy-900">{summary.graded_count} / {summary.submission_count}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-brand-muted">Submitted by due date</p><p className="mt-1 text-xl font-semibold text-navy-900">{summary.due_date_submission_count ? formatPercent(summary.on_time_count * 100 / summary.due_date_submission_count) : '—'}</p></CardContent></Card>
        </div>
      )}

      <Card className="overflow-hidden">
        <div className="border-b border-slate-200 px-4 py-3 sm:px-5">
          <h2 className="text-sm font-semibold text-navy-900">Labs with assignments</h2>
        </div>
        {loading ? (
          <div className="flex min-h-40 items-center justify-center gap-2 text-sm text-brand-muted"><Loader2 className="h-4 w-4 animate-spin" />Loading activity…</div>
        ) : labs.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-sm">
              <thead className="bg-slate-50 text-xs text-brand-muted">
                <tr><th className="px-4 py-3 font-medium sm:px-5">Lab</th><th className="px-4 py-3 font-medium">Assignments</th><th className="px-4 py-3 font-medium">Submissions</th><th className="px-4 py-3 font-medium">Average score</th><th className="px-4 py-3 font-medium">Status</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {labs.map((lab) => (
                  <tr key={lab.id}>
                    <td className="px-4 py-3 font-medium text-navy-900 sm:px-5">{lab.title}</td>
                    <td className="px-4 py-3 text-slate-600">{lab.assignment_count}</td>
                    <td className="px-4 py-3 text-slate-600">{lab.submission_count}</td>
                    <td className="px-4 py-3 text-slate-600">{formatPercent(lab.average_score)}</td>
                    <td className="px-4 py-3"><Badge variant={lab.submission_count && lab.graded_count === lab.submission_count ? 'success' : 'neutral'} size="sm">{lab.submission_count === 0 ? 'No submissions' : lab.graded_count === lab.submission_count ? 'Reviewed' : 'Needs review'}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="px-5 py-12 text-center">
            <BarChart3 className="mx-auto mb-3 h-8 w-8 text-slate-300" />
            <h2 className="font-semibold text-navy-900">No assignment activity yet</h2>
            <p className="mt-1 text-sm text-brand-muted">Create an assignment for one of your classes to see submissions and grades here.</p>
          </div>
        )}
      </Card>
    </div>
  );
};

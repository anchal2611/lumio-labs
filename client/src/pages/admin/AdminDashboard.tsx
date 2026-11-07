import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  GraduationCap,
  FlaskConical,
  Activity,
  History,
  Settings,
  Bell,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Server,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { apiGet } from '../../services/api';

type AdminStats = { totalStudents: number; totalTeachers: number; totalClasses: number; totalLabs: number; activeStudents: number; recentJoins: Array<{ id: string; name: string; email: string; role: string; status: string; created_at: string }> };

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [activeSessions, setActiveSessions] = useState(0);
  const [loadError, setLoadError] = useState('');
  useEffect(() => {
    let alive = true;
    Promise.all([apiGet<AdminStats>('/admin/stats'), apiGet<{ sessions: unknown[] }>('/collab/sessions')])
      .then(([data, sessions]) => { if (alive) { setStats(data); setActiveSessions(sessions.sessions?.length || 0); } })
      .catch((err) => { if (alive) setLoadError(err instanceof Error ? err.message : 'Could not load institute overview.'); });
    return () => { alive = false; };
  }, []);

  return (
    <div className="space-y-8">
      {/* Admin Header Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-amber-950 rounded-2xl p-6 sm:p-8 text-white shadow-floating relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-400 text-xs font-semibold mb-3">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Institute administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Institutional Laboratory Administration
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
            Review students, faculty, laboratories and collaboration activity for your institute.
          </p>

          <div className="mt-5 flex items-center gap-3 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              onClick={() => navigate('/admin/users')}
            >
              Manage Users
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              onClick={() => navigate('/admin/reports')}
            >
              View Reports
            </Button>
          </div>
        </div>

        {/* Status Badge */}
        <div className="relative z-10 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-center min-w-[200px]">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Workspace Online</span>
          </div>
          <p className="text-[11px] text-slate-300">Institute data loaded from the API</p>
          <Badge variant="aqua" size="sm" className="mt-3">Live institute data</Badge>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-slate-200/80">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-brand-muted font-medium">Registered Students</p>
              <h3 className="text-lg font-bold text-navy-900 mt-0.5">{stats?.totalStudents ?? '—'}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-brand-muted font-medium">Verified Faculty</p>
              <h3 className="text-lg font-bold text-navy-900 mt-0.5">{stats?.totalTeachers ?? '—'} Teachers</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-brand-muted font-medium">Active Laboratories</p>
              <h3 className="text-lg font-bold text-navy-900 mt-0.5">{stats?.totalLabs ?? '—'} Labs</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-brand-muted font-medium">Concurrent Sessions</p>
              <h3 className="text-lg font-bold text-navy-900 mt-0.5">{activeSessions} Active</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Quick User Directory */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-slate-200/80">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>Recent institute users</CardTitle>
                <p className="text-xs text-brand-muted mt-0.5">
                  Latest student, teacher and administrator accounts
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => navigate('/admin/users')}>
                View Full Directory
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-100/70 text-navy-900 uppercase text-[10px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">User</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">Email</th>
                    <th className="p-3.5">Account</th>
                    <th className="p-3.5 text-right">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loadError && <tr><td colSpan={5} className="p-4 text-center text-red-700">{loadError}</td></tr>}
                  {!loadError && (stats?.recentJoins || []).map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="p-3.5 font-bold text-navy-900">{u.name}</td>
                      <td className="p-3.5 capitalize font-medium">{u.role}</td>
                      <td className="p-3.5 text-slate-600">{u.email}</td>
                      <td className="p-3.5">
                        <Badge variant={u.status === 'active' ? 'success' : 'warning'} size="sm">
                          {u.status}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-right text-slate-500">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {!loadError && stats && stats.recentJoins.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-brand-muted">No institute users yet.</td></tr>}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* Recent registrations */}
        <div className="space-y-6">
          <Card className="border border-slate-200/80">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <History className="w-4 h-4 text-primary" />
                <span>Recent registrations</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(stats?.recentJoins || []).slice(0, 4).map((evt) => (
                <div key={evt.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-navy-900">New {evt.role} account</span>
                    <span className="text-[10px] text-slate-400">{new Date(evt.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-[11px] text-brand-muted mt-1">{evt.name} · {evt.email}</p>
                </div>
              ))}
              {!loadError && stats?.recentJoins.length === 0 && <p className="py-4 text-center text-xs text-brand-muted">Recent registrations will appear here.</p>}
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs"
                onClick={() => navigate('/admin/reports')}
              >
                View Reports
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

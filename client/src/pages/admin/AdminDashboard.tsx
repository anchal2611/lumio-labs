import React from 'react';
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
import { useAuth } from '../../contexts/AuthContext';
import { MOCK_STUDENTS_LIST, MOCK_LABS } from '../../services/mockData';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const auditEvents = [
    { id: '1', action: 'Teacher Verified', user: 'Prof. Marcus Vance', time: '10 mins ago', status: 'Success' },
    { id: '2', action: 'Practical Published', user: 'Dr. Eleanor Brooks', time: '1 hour ago', status: 'Success' },
    { id: '3', action: 'WASM Sandbox Loaded', user: 'Alex Chen', time: '2 hours ago', status: 'Notice' },
    { id: '4', action: 'Password Reset', user: 'Liam O\'Connor', time: '5 hours ago', status: 'Success' },
  ];

  return (
    <div className="space-y-8">
      {/* Admin Header Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-amber-950 rounded-2xl p-6 sm:p-8 text-white shadow-floating relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-400 text-xs font-semibold mb-3">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Digital Infrastructure Management Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Institutional Laboratory Administration
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
            Oversee all registered students, verify faculty credentials, monitor concurrent sandbox execution clusters, and maintain audit integrity.
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
              View System Audit Logs
            </Button>
          </div>
        </div>

        {/* Status Badge */}
        <div className="relative z-10 p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-center min-w-[200px]">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">Cluster Online</span>
          </div>
          <p className="text-[11px] text-slate-300">SQLite WASM & Sandbox Active</p>
          <Badge variant="warning" size="sm" className="mt-3">
            Demo Analytics Active
          </Badge>
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
              <h3 className="text-lg font-bold text-navy-900 mt-0.5">1,248</h3>
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
              <h3 className="text-lg font-bold text-navy-900 mt-0.5">64 Professors</h3>
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
              <h3 className="text-lg font-bold text-navy-900 mt-0.5">{MOCK_LABS.length} Stations</h3>
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
              <h3 className="text-lg font-bold text-navy-900 mt-0.5">28 Live Peers</h3>
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
                <CardTitle>User Directory & Verification</CardTitle>
                <p className="text-xs text-brand-muted mt-0.5">
                  Recent student registrations and pending faculty access requests
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
                    <th className="p-3.5">Department</th>
                    <th className="p-3.5">Verification</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {MOCK_STUDENTS_LIST.slice(0, 4).map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="p-3.5 font-bold text-navy-900">{u.name}</td>
                      <td className="p-3.5 capitalize font-medium">{u.role}</td>
                      <td className="p-3.5 text-slate-600">{u.department}</td>
                      <td className="p-3.5">
                        <Badge variant="success" size="sm">
                          Verified
                        </Badge>
                      </td>
                      <td className="p-3.5 text-right">
                        <Button size="sm" variant="ghost" className="text-xs">
                          Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Security Audit Logs */}
        <div className="space-y-6">
          <Card className="border border-slate-200/80">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <History className="w-4 h-4 text-primary" />
                <span>Security Audit Log</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {auditEvents.map((evt) => (
                <div key={evt.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-navy-900">{evt.action}</span>
                    <span className="text-[10px] text-slate-400">{evt.time}</span>
                  </div>
                  <p className="text-[11px] text-brand-muted mt-1">Initiator: {evt.user}</p>
                </div>
              ))}
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs"
                onClick={() => navigate('/admin/reports')}
              >
                View Detailed Audit Trail
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  FlaskConical,
  FileCode2,
  Users2,
  ClipboardList,
  Sparkles,
  ArrowRight,
  Play,
  Clock,
  CheckCircle2,
  Bell,
  Code2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LabCard } from '../../components/labs/LabCard';
import {
  MOCK_LABS,
  MOCK_ASSIGNMENTS,
  MOCK_COLLAB_ROOMS,
  MOCK_ANNOUNCEMENTS,
} from '../../services/mockData';
import { useLabStore } from '../../store/useLabStore';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { savedExperiments, setActiveLab } = useLabStore();

  const activeAssignments = MOCK_ASSIGNMENTS.filter((a) => a.status === 'published');

  return (
    <div className="space-y-8">
      {/* A. Welcome Banner */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-primary-dark rounded-2xl p-6 sm:p-8 text-white shadow-floating relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-brand-aqua text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Semester {user?.semester || 4} • {user?.department}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Student'}!
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
            Ready to explore? Your compiler sandbox and virtual IoT breadboards are ready. You have{' '}
            <strong className="text-brand-aqua">{activeAssignments.length} practical assignments</strong>{' '}
            due this week.
          </p>

          <div className="mt-5 flex items-center gap-3 flex-wrap">
            <Button
              size="sm"
              variant="accent"
              leftIcon={<Play className="w-3.5 h-3.5 fill-white" />}
              onClick={() => {
                setActiveLab(MOCK_LABS[0]);
                navigate(`/student/labs/${MOCK_LABS[0].id}`);
              }}
            >
              Resume Python Lab
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              leftIcon={<Users2 className="w-3.5 h-3.5" />}
              onClick={() => navigate('/student/collaboration')}
            >
              Join Study Room
            </Button>
          </div>
        </div>

        {/* User Cardlet */}
        <div className="relative z-10 hidden lg:flex flex-col items-center p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-center min-w-[200px]">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
            alt={user?.name}
            className="w-16 h-16 rounded-full object-cover ring-2 ring-brand-aqua"
          />
          <h4 className="text-sm font-bold mt-2">{user?.name}</h4>
          <span className="text-[11px] text-brand-aqua font-mono">{user?.rollNumber}</span>
          <Badge variant="aqua" size="sm" className="mt-2">
            Active Scholar
          </Badge>
        </div>
      </div>

      {/* B. Key Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-slate-200/80">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center shrink-0">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-brand-muted font-medium">Labs Completed</p>
              <h3 className="text-lg font-bold text-navy-900 mt-0.5">8 / 16</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <FileCode2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-brand-muted font-medium">Experiments Performed</p>
              <h3 className="text-lg font-bold text-navy-900 mt-0.5">32 Programs</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
              <Users2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-brand-muted font-medium">Active Collaborations</p>
              <h3 className="text-lg font-bold text-navy-900 mt-0.5">3 Peer Rooms</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-brand-muted font-medium">Assignments Pending</p>
              <h3 className="text-lg font-bold text-navy-900 mt-0.5">{activeAssignments.length} Required</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Left Laboratories & Right Sidebar Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols wide) */}
        <div className="lg:col-span-2 space-y-8">
          {/* C & D. Explore Laboratories */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-navy-900 tracking-tight">
                  University Laboratories
                </h2>
                <p className="text-xs text-brand-muted">
                  Interactive workspaces with guided practicals and blank sandboxes
                </p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                onClick={() => navigate('/student/labs')}
              >
                View All Labs
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {MOCK_LABS.slice(0, 4).map((lab) => (
                <LabCard key={lab.id} lab={lab} />
              ))}
            </div>
          </div>

          {/* E. Active Collaboration Sessions */}
          <Card className="border border-slate-200/80">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>Active Peer Collaboration Rooms</CardTitle>
                <p className="text-xs text-brand-muted mt-0.5">
                  Live collaborative coding sessions happening in your department right now
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate('/student/collaboration')}
              >
                Join or Create
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {MOCK_COLLAB_ROOMS.map((room) => (
                <div
                  key={room.id}
                  onClick={() => navigate('/student/collaboration')}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-xs transition-all cursor-pointer flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-navy-900">{room.title}</h4>
                      <Badge variant="aqua" size="sm">
                        {room.roomCode}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-brand-muted mt-0.5 line-clamp-1">
                      {room.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] text-slate-500 font-medium">
                      {room.participants.length} Active
                    </span>
                    <Button size="sm" variant="accent" className="text-xs py-1 px-3">
                      Enter Room
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1 Col wide) */}
        <div className="space-y-6">
          {/* F. Upcoming Practical Assignments */}
          <Card className="border border-slate-200/80">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle>Upcoming Assignments</CardTitle>
              <Badge variant="warning" size="sm">
                Action Required
              </Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeAssignments.map((asg) => (
                <div
                  key={asg.id}
                  onClick={() => navigate('/student/assignments')}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                      {asg.subjectCode}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Due Nov 15
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-navy-900 mt-1.5 leading-snug">
                    {asg.title}
                  </h4>
                  <p className="text-[11px] text-brand-muted mt-1">{asg.labName}</p>
                </div>
              ))}
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs"
                onClick={() => navigate('/student/assignments')}
              >
                Go to Assignment Portal
              </Button>
            </CardContent>
          </Card>

          {/* H. University Announcements */}
          <Card className="border border-slate-200/80">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-500" />
                <span>Department Notices</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {MOCK_ANNOUNCEMENTS.map((anc) => (
                <div key={anc.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] font-bold uppercase text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                    {anc.priority}
                  </span>
                  <h4 className="text-xs font-bold text-navy-900 mt-1">{anc.title}</h4>
                  <p className="text-[11px] text-brand-muted mt-1 leading-relaxed">{anc.content}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

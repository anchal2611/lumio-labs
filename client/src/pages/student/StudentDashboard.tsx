import React, { useState, useEffect } from 'react';
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
  BookOpen,
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
import { apiGet } from '../../services/api';

interface RealLabItem {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  language: string;
  teacher_name?: string;
  exercises?: any[];
}

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { savedExperiments, setActiveLab } = useLabStore();
  const [classLabs, setClassLabs] = useState<RealLabItem[]>([]);
  const [loadingLabs, setLoadingLabs] = useState(false);

  useEffect(() => {
    // Fetch assigned labs from student's enrolled classes
    apiGet<{ labs: RealLabItem[] }>('/labs')
      .then((data) => {
        if (data.labs && Array.isArray(data.labs)) {
          setClassLabs(data.labs);
        }
      })
      .catch(() => {});
  }, []);

  const activeAssignments = MOCK_ASSIGNMENTS.filter((a) => a.status === 'published');

  return (
    <div className="space-y-8">
      {/* A. Welcome Banner */}
      <div className="bg-gradient-to-r from-navy-900 via-navy-800 to-primary-dark rounded-2xl p-6 sm:p-8 text-white shadow-floating relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-brand-aqua text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Semester {user?.semester || 4} • {user?.department || 'Computer Science'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Student'}!
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
            Ready to experiment? Your compiler sandbox, interactive SQL console, and virtual IoT breadboards are ready.
            {classLabs.length > 0 ? (
              <> You have <strong className="text-brand-aqua">{classLabs.length} assigned classroom lab(s)</strong> waiting.</>
            ) : null}
          </p>

          <div className="mt-5 flex items-center gap-3 flex-wrap">
            <Button
              size="sm"
              variant="accent"
              leftIcon={<Play className="w-3.5 h-3.5 fill-white" />}
              onClick={() => {
                if (classLabs.length > 0) {
                  navigate(`/student/labs/${classLabs[0].id}`);
                } else {
                  navigate(`/student/labs/lab-python`);
                }
              }}
            >
              {classLabs.length > 0 ? `Open: ${classLabs[0].title}` : 'Launch Python Lab'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              leftIcon={<BookOpen className="w-3.5 h-3.5" />}
              onClick={() => navigate('/student/classes')}
            >
              My Classes
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              leftIcon={<Users2 className="w-3.5 h-3.5" />}
              onClick={() => navigate('/student/collaboration')}
            >
              Study Room
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
          <span className="text-[11px] text-brand-aqua font-mono">{user?.rollNumber || 'LUMIO Scholar'}</span>
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
              <p className="text-[11px] text-brand-muted font-medium">Assigned Class Labs</p>
              <h3 className="text-lg font-bold text-navy-900 mt-0.5">{classLabs.length} Available</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <FileCode2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-brand-muted font-medium">Virtual Laboratories</p>
              <h3 className="text-lg font-bold text-navy-900 mt-0.5">{MOCK_LABS.length} Workspaces</h3>
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
              <h3 className="text-lg font-bold text-navy-900 mt-0.5">Live Sync Enabled</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-brand-muted font-medium">Coursework & Tasks</p>
              <h3 className="text-lg font-bold text-navy-900 mt-0.5">{activeAssignments.length} Practicals</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* C. Class Assigned Labs (if any exist in database) */}
      {classLabs.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-navy-900 tracking-tight flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-aqua" />
                Assigned Classroom Laboratories
              </h2>
              <p className="text-xs text-brand-muted">
                Official laboratory modules assigned by your faculty for coursework and evaluation
              </p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              onClick={() => navigate('/student/classes')}
            >
              View Classes
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classLabs.map((lab) => (
              <Card
                key={lab.id}
                hoverable
                onClick={() => navigate(`/student/labs/${lab.id}`)}
                className="border border-primary/20 bg-primary/5 cursor-pointer"
              >
                <CardContent className="p-5 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <Badge variant="primary" size="sm" className="capitalize">
                        {lab.language}
                      </Badge>
                      <Badge variant="aqua" size="sm">
                        Class Lab
                      </Badge>
                    </div>
                    <h3 className="text-base font-bold text-navy-900">{lab.title}</h3>
                    <p className="text-xs text-brand-muted mt-1 line-clamp-2">{lab.description}</p>
                    <p className="text-[11px] text-slate-500 mt-3 font-medium">
                      Instructor: <span className="text-navy-900">{lab.teacher_name || 'Faculty'}</span>
                    </p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="text-xs text-brand-muted font-medium">
                      {lab.exercises?.length || 0} Exercises
                    </span>
                    <Button size="sm" variant="primary">
                      Launch Lab →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: University Laboratories & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* University Laboratories */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-navy-900 tracking-tight">
                  University Laboratories & Workspaces
                </h2>
                <p className="text-xs text-brand-muted">
                  Interactive workstations with compiler engines, SQL databases, and hardware simulators
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

          {/* Active Collaboration Sessions */}
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
                      <span className="text-xs font-bold text-navy-900">{room.title}</span>
                      <Badge variant="primary" size="sm" className="uppercase font-mono">
                        {room.language}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-brand-muted mt-0.5">
                      Hosted by {room.hostName} • {room.participants.length} active peer(s)
                    </p>
                  </div>
                  <Button size="sm" variant="accent">
                    Enter Session
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar Feeds */}
        <div className="space-y-6">
          {/* Announcements */}
          <Card className="border border-slate-200/80">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Department Announcements</CardTitle>
              <Bell className="w-4 h-4 text-brand-muted" />
            </CardHeader>
            <CardContent className="space-y-3">
              {MOCK_ANNOUNCEMENTS.map((ann) => (
                <div key={ann.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                      {ann.authorRole}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(ann.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-navy-900 mt-1">{ann.title}</h4>
                  <p className="text-[11px] text-brand-muted mt-1 leading-relaxed">
                    {ann.content}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Shortcuts */}
          <Card className="border border-slate-200/80 bg-gradient-to-br from-slate-50 to-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Quick Lab Shortcuts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs font-medium"
                leftIcon={<Code2 className="w-3.5 h-3.5 text-primary" />}
                onClick={() => navigate('/student/labs/lab-python')}
              >
                Python Algorithms Sandbox
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs font-medium"
                leftIcon={<FileCode2 className="w-3.5 h-3.5 text-teal-600" />}
                onClick={() => navigate('/student/labs/lab-sql')}
              >
                SQL Relational Workbench
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-xs font-medium"
                leftIcon={<FlaskConical className="w-3.5 h-3.5 text-amber-500" />}
                onClick={() => navigate('/student/labs/lab-iot')}
              >
                ESP32 IoT Breadboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

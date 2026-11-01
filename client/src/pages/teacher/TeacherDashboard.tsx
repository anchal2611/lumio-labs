import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAssignmentStore } from '../../store/useAssignmentStore';
import {
  GraduationCap,
  ClipboardList,
  FlaskConical,
  Users2,
  Plus,
  ArrowRight,
  Sparkles,
  Award,
  CheckCircle2,
  Clock,
  BookOpen,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { GradingDrawer } from '../../components/practicals/GradingDrawer';
import { AssignmentModal } from '../../components/practicals/AssignmentModal';
import { MOCK_LABS, MOCK_SUBMISSIONS } from '../../services/mockData';

export const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { assignments, submissions, gradeSubmission } = useAssignmentStore();

  const [selectedSubForGrade, setSelectedSubForGrade] = useState<any | null>(null);
  const [showCreateAsgModal, setShowCreateAsgModal] = useState(false);

  const pendingSubmissions = submissions.filter((s) => s.status === 'pending');

  return (
    <div className="space-y-8">
      {/* Faculty Welcome Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-teal-900 rounded-2xl p-6 sm:p-8 text-white shadow-floating relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-brand-aqua text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Faculty Portal • {user?.department}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {user?.name || 'Professor'}!
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
            Manage your laboratory practicals, evaluate student code submissions, and collaborate on shared department curricula.
          </p>

          <div className="mt-5 flex items-center gap-3 flex-wrap">
            <Button
              size="sm"
              variant="accent"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setShowCreateAsgModal(true)}
            >
              Create New Practical Assignment
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              leftIcon={<Users2 className="w-3.5 h-3.5" />}
              onClick={() => navigate('/teacher/collaboration')}
            >
              Faculty Co-Authoring Workspace
            </Button>
          </div>
        </div>

        {/* Professor Cardlet */}
        <div className="relative z-10 hidden lg:flex flex-col items-center p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-center min-w-[220px]">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
            alt={user?.name}
            className="w-16 h-16 rounded-full object-cover ring-2 ring-teal-400"
          />
          <h4 className="text-sm font-bold mt-2">{user?.name}</h4>
          <span className="text-[11px] text-brand-aqua">{user?.designation || 'Lab Director'}</span>
          <Badge variant="aqua" size="sm" className="mt-2">
            Faculty Evaluator
          </Badge>
        </div>
      </div>

      {/* Key Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border border-slate-200/80">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-brand-muted font-medium">Assigned Students</p>
              <h3 className="text-lg font-bold text-navy-900 mt-0.5">142 Enrolled</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center shrink-0">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-brand-muted font-medium">Active Practicals</p>
              <h3 className="text-lg font-bold text-navy-900 mt-0.5">{assignments.length} Courseworks</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-brand-muted font-medium">Pending Submissions</p>
              <h3 className="text-lg font-bold text-navy-900 mt-0.5">{pendingSubmissions.length} To Review</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80">
          <CardContent className="p-4 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-brand-muted font-medium">Evaluations Published</p>
              <h3 className="text-lg font-bold text-navy-900 mt-0.5">79 Graded</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols wide): Submissions Pending Review */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-slate-200/80">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle>Student Code Submissions Awaiting Evaluation</CardTitle>
                <p className="text-xs text-brand-muted mt-0.5">
                  Review student implementations, inspect test run outputs, and award marks
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={() => navigate('/teacher/assignments')}>
                View All
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {submissions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white hover:border-primary/40 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-navy-900">{sub.studentName}</h4>
                      <span className="text-[10px] text-brand-muted font-mono">({sub.studentRollNo})</span>
                      <Badge variant={sub.status === 'graded' ? 'success' : 'warning'} size="sm">
                        {sub.status === 'graded' ? `Graded: ${sub.marksObtained}/${sub.maxMarks}` : 'Pending Review'}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{sub.assignmentTitle}</p>
                    <span className="text-[10px] text-slate-400">
                      Submitted {new Date(sub.submittedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <Button
                    size="sm"
                    variant={sub.status === 'graded' ? 'outline' : 'primary'}
                    leftIcon={<Award className="w-3.5 h-3.5" />}
                    onClick={() => setSelectedSubForGrade(sub)}
                  >
                    {sub.status === 'graded' ? 'Edit Grade' : 'Grade Submission'}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Managed Labs */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-navy-900 tracking-tight">
                Laboratories Under Your Direction
              </h2>
              <Button size="sm" variant="ghost" onClick={() => navigate('/teacher/labs')}>
                Manage Labs
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {MOCK_LABS.slice(0, 2).map((lab) => (
                <Card key={lab.id} className="border border-slate-200">
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-navy-900">{lab.name}</span>
                      <Badge variant="aqua" size="sm">
                        Active
                      </Badge>
                    </div>
                    <p className="text-xs text-brand-muted line-clamp-2">{lab.description}</p>
                    <div className="pt-3 mt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                      <span className="text-slate-500">{lab.experimentCount} Practicals</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/teacher/labs`)}
                      >
                        Instructor View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Faculty Collaboration & Resources */}
        <div className="space-y-6">
          <Card className="border border-slate-200/80">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-teal-600" />
                <span>Department Syllabus Co-Authors</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <h4 className="font-bold text-navy-900">Dr. Eleanor Brooks</h4>
                <p className="text-[11px] text-brand-muted mt-0.5">
                  Co-Author on CS401 Operating Systems Manual
                </p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] text-emerald-700 font-medium">Online Now</span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <h4 className="font-bold text-navy-900">Dr. Aris Thorne</h4>
                <p className="text-[11px] text-brand-muted mt-0.5">
                  Electrical Eng. Microcontroller Simulator Lead
                </p>
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  <span className="text-[10px] text-slate-500">Offline</span>
                </div>
              </div>

              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs"
                onClick={() => navigate('/teacher/collaboration')}
              >
                Open Faculty Lounge
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Grading Drawer */}
      {selectedSubForGrade && (
        <GradingDrawer
          submission={selectedSubForGrade}
          onClose={() => setSelectedSubForGrade(null)}
          onSaveGrade={(marks, feedback) => {
            gradeSubmission(selectedSubForGrade.id, marks, feedback);
            setSelectedSubForGrade(null);
          }}
        />
      )}

      {/* Create Assignment Modal */}
      <AssignmentModal
        isOpen={showCreateAsgModal}
        onClose={() => setShowCreateAsgModal(false)}
      />
    </div>
  );
};

import React, { useState } from 'react';
import { useAssignmentStore } from '../../store/useAssignmentStore';
import { ClipboardList, Plus, Award, CheckCircle2, Clock, Eye, FileCode } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { GradingDrawer } from '../../components/practicals/GradingDrawer';
import { AssignmentModal } from '../../components/practicals/AssignmentModal';

export const TeacherAssignments: React.FC = () => {
  const { assignments, submissions, gradeSubmission } = useAssignmentStore();
  const [selectedSub, setSelectedSub] = useState<any | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ClipboardList className="w-5 h-5 text-teal-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-navy-900 tracking-tight">
              Assignment & Grading Oversight
            </h1>
          </div>
          <p className="text-xs text-brand-muted">
            Track class submission progress, review source code, and publish evaluative marks
          </p>
        </div>

        <Button
          size="sm"
          variant="accent"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => setShowCreateModal(true)}
        >
          Create Assignment
        </Button>
      </div>

      {/* Submissions Table Card */}
      <Card className="border border-slate-200/80">
        <div className="p-4 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
          <span className="text-xs font-bold text-navy-900 uppercase tracking-wider">
            Student Submissions Log ({submissions.length})
          </span>
          <Badge variant="aqua" size="sm">
            Real-Time Updates
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100/70 text-navy-900 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3.5">Student Name</th>
                <th className="p-3.5">Roll Number</th>
                <th className="p-3.5">Assignment</th>
                <th className="p-3.5">Submitted On</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Score</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {submissions.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3.5 font-bold text-navy-900">{sub.studentName}</td>
                  <td className="p-3.5 font-mono text-slate-500">{sub.studentRollNo}</td>
                  <td className="p-3.5 text-slate-700 font-medium">{sub.assignmentTitle}</td>
                  <td className="p-3.5 text-slate-400">
                    {new Date(sub.submittedAt).toLocaleDateString()}
                  </td>
                  <td className="p-3.5">
                    <Badge variant={sub.status === 'graded' ? 'success' : 'warning'} size="sm">
                      {sub.status === 'graded' ? 'Evaluated' : 'Pending Review'}
                    </Badge>
                  </td>
                  <td className="p-3.5 font-bold text-navy-900">
                    {sub.marksObtained !== undefined ? `${sub.marksObtained} / ${sub.maxMarks}` : '—'}
                  </td>
                  <td className="p-3.5 text-right">
                    <Button
                      size="sm"
                      variant={sub.status === 'graded' ? 'outline' : 'primary'}
                      leftIcon={<Award className="w-3.5 h-3.5" />}
                      onClick={() => setSelectedSub(sub)}
                    >
                      {sub.status === 'graded' ? 'Review Grade' : 'Grade Code'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Grading Drawer */}
      {selectedSub && (
        <GradingDrawer
          submission={selectedSub}
          onClose={() => setSelectedSub(null)}
          onSaveGrade={(marks, feedback) => {
            gradeSubmission(selectedSub.id, marks, feedback);
            setSelectedSub(null);
          }}
        />
      )}

      {/* Assignment Modal */}
      <AssignmentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
};

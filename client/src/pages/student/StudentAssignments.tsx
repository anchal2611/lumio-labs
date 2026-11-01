import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssignmentStore } from '../../store/useAssignmentStore';
import { useAuth } from '../../contexts/AuthContext';
import {
  ClipboardList,
  Clock,
  Award,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Send,
  FileCode,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useToast } from '../../contexts/ToastContext';

export const StudentAssignments: React.FC = () => {
  const { assignments, submissions, submitAssignment } = useAssignmentStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [selectedAsgForSubmit, setSelectedAsgForSubmit] = useState<any | null>(null);
  const [submissionCode, setSubmissionCode] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');

  const handleOpenSubmitModal = (asg: any) => {
    setSelectedAsgForSubmit(asg);
    setSubmissionCode(asg.starterCode || '');
    setSubmissionNotes('');
  };

  const handleConfirmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedAsgForSubmit) return;

    submitAssignment({
      assignmentId: selectedAsgForSubmit.id,
      assignmentTitle: selectedAsgForSubmit.title,
      studentId: user.id,
      studentName: user.name,
      studentEmail: user.email,
      studentRollNo: user.rollNumber || 'CS-2024-042',
      code: submissionCode,
      notes: submissionNotes,
      maxMarks: selectedAsgForSubmit.maxMarks,
    });

    toast.success('Assignment Submitted', 'Your submission was logged and sent for faculty review.');
    setSelectedAsgForSubmit(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <ClipboardList className="w-5 h-5 text-primary" />
          <h1 className="text-xl sm:text-2xl font-bold text-navy-900 tracking-tight">
            Practical Assignments
          </h1>
        </div>
        <p className="text-xs text-brand-muted">
          Manage coursework submissions, review teacher grading feedback, and access starter templates
        </p>
      </div>

      {/* Assignments List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {assignments.map((asg) => {
          const submission = submissions.find(
            (s) => s.assignmentId === asg.id && s.studentId === user?.id
          );
          const isGraded = submission?.status === 'graded';
          const isPending = submission?.status === 'pending';

          return (
            <Card key={asg.id} className="border border-slate-200/80 flex flex-col justify-between">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded">
                      {asg.subjectCode}
                    </span>
                    <h3 className="text-base font-bold text-navy-900 mt-2 leading-snug">
                      {asg.title}
                    </h3>
                  </div>

                  {isGraded ? (
                    <Badge variant="success" size="sm" className="shrink-0">
                      Graded: {submission.marksObtained} / {asg.maxMarks}
                    </Badge>
                  ) : isPending ? (
                    <Badge variant="warning" size="sm" className="shrink-0">
                      Under Review
                    </Badge>
                  ) : (
                    <Badge variant="neutral" size="sm" className="shrink-0">
                      Pending Submit
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-brand-muted leading-relaxed line-clamp-2 mb-4">
                  {asg.description}
                </p>

                {/* Rubric Points */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 mb-4 space-y-1.5">
                  <span className="text-[11px] font-bold text-navy-900 block">Grading Rubric:</span>
                  {asg.rubrics.map((r) => (
                    <div key={r.id} className="flex items-center justify-between text-[11px] text-slate-600">
                      <span>• {r.criterion}</span>
                      <span className="font-semibold">{r.maxMarks} pts</span>
                    </div>
                  ))}
                </div>

                {/* Feedback box if graded */}
                {isGraded && submission.feedback && (
                  <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl mb-4 text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-900 font-bold mb-1">
                      <Award className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Feedback from {submission.gradedBy || 'Faculty'}:</span>
                    </div>
                    <p className="text-emerald-800 text-[11px] leading-relaxed">
                      {submission.feedback}
                    </p>
                  </div>
                )}

                {/* Meta */}
                <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Due {new Date(asg.deadline).toLocaleDateString()}
                  </span>
                  <span className="font-medium text-navy-900">{asg.labName}</span>
                </div>
              </CardContent>

              {/* Actions */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<FileCode className="w-3.5 h-3.5 text-primary" />}
                  onClick={() => navigate(`/student/labs/${asg.labId}`)}
                >
                  Work in Lab
                </Button>

                <Button
                  size="sm"
                  variant={isGraded ? 'outline' : 'primary'}
                  leftIcon={<Send className="w-3.5 h-3.5" />}
                  onClick={() => handleOpenSubmitModal(asg)}
                >
                  {isGraded ? 'Resubmit Assignment' : isPending ? 'Update Submission' : 'Submit Code'}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Submission Modal */}
      {selectedAsgForSubmit && (
        <Modal
          isOpen={Boolean(selectedAsgForSubmit)}
          onClose={() => setSelectedAsgForSubmit(null)}
          title={`Submit: ${selectedAsgForSubmit.title}`}
          description={`Submit your verified code for ${selectedAsgForSubmit.subjectCode}. Max score: ${selectedAsgForSubmit.maxMarks} marks.`}
          maxWidth="2xl"
        >
          <form onSubmit={handleConfirmSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-xs font-semibold text-navy-900 mb-1">
                Completed Program Code
              </label>
              <textarea
                rows={8}
                value={submissionCode}
                onChange={(e) => setSubmissionCode(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-navy-950 p-3 font-mono text-emerald-300 text-xs focus:outline-none focus:border-primary resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy-900 mb-1">
                Student Notes & Verification Output (Optional)
              </label>
              <textarea
                rows={3}
                value={submissionNotes}
                onChange={(e) => setSubmissionNotes(e.target.value)}
                placeholder="Describe any edge cases handled or benchmark results..."
                className="w-full rounded-xl border border-slate-300 p-3 text-xs text-brand-text placeholder:text-slate-400 focus:outline-none focus:border-primary resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <Button size="sm" variant="outline" type="button" onClick={() => setSelectedAsgForSubmit(null)}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" type="submit">
                Confirm & Submit Evaluation
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

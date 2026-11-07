import React, { useState } from 'react';
import { Submission } from '../../types/assignment';
import {
  Award,
  X,
  FileCode,
  Terminal,
  Loader2,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useToast } from '../../contexts/ToastContext';

interface GradingDrawerProps {
  submission: Submission;
  onClose: () => void;
  onSaveGrade: (marks: number, feedback: string, rubricScores?: Record<string, number>) => void | Promise<void>;
}

export const GradingDrawer: React.FC<GradingDrawerProps> = ({
  submission,
  onClose,
  onSaveGrade,
}) => {
  const [marks, setMarks] = useState<number>(submission.marksObtained ?? submission.maxMarks);
  const [feedback, setFeedback] = useState<string>(
    submission.feedback || ''
  );
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!Number.isFinite(marks) || marks < 0 || marks > submission.maxMarks) {
      toast.error('Invalid marks', `Enter a score between 0 and ${submission.maxMarks}.`);
      return;
    }
    setSaving(true);
    try { await onSaveGrade(marks, feedback); onClose(); }
    catch { /* Caller reports the API error; keep the drawer open for retry. */ }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-navy-950/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-2xl bg-white h-full shadow-floating flex flex-col border-l border-slate-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-navy-900">{submission.assignmentTitle}</span>
              <Badge variant={submission.status === 'graded' ? 'success' : 'warning'} size="sm">
                {submission.status}
              </Badge>
            </div>
            <p className="text-xs text-brand-muted mt-0.5">
              Student: <strong className="text-navy-900">{submission.studentName}</strong> ({submission.studentRollNo})
            </p>
          </div>

          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5 text-xs">
          {/* Submitted Code Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-navy-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-primary" /> Submitted Code
              </span>
              <span className="text-[10px] text-slate-400">
                Submitted {new Date(submission.submittedAt).toLocaleString()}
              </span>
            </div>
            <pre className="p-3 bg-navy-950 text-emerald-300 font-mono text-[11px] rounded-xl overflow-x-auto max-h-56 border border-navy-800">
              {submission.code}
            </pre>
          </div>

          {/* Execution Output (if available) */}
          {submission.stdout && (
            <div>
              <span className="font-bold text-navy-900 uppercase tracking-wider text-[11px] mb-1.5 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-teal-600" /> Student Verification Output
              </span>
              <pre className="p-3 bg-slate-900 text-slate-200 font-mono text-[11px] rounded-xl overflow-x-auto max-h-36 border border-slate-800">
                {submission.stdout}
              </pre>
            </div>
          )}

          {/* Student Notes */}
          {submission.notes && (
            <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 text-slate-700">
              <span className="font-bold text-blue-900 block mb-0.5">Student Remarks:</span>
              <p>{submission.notes}</p>
            </div>
          )}

          {/* Grading Form */}
          <form onSubmit={handleSave} className="space-y-4 pt-3 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-navy-900 mb-1">
                Marks Awarded (Max: {submission.maxMarks})
              </label>
              <input
                type="number"
                min={0}
                max={submission.maxMarks}
                value={marks}
                onChange={(e) => setMarks(Number(e.target.value))}
                className="w-32 rounded-lg border border-slate-300 p-2 text-sm font-bold text-navy-900 focus:outline-none focus:border-primary"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy-900 mb-1">
                Faculty Constructive Feedback & Rubric Notes
              </label>
              <textarea
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Write constructive notes for the student..."
                className="w-full rounded-xl border border-slate-300 p-3 text-xs text-brand-text placeholder:text-slate-400 focus:outline-none focus:border-primary resize-none"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3">
              <Button size="sm" variant="outline" type="button" onClick={onClose} disabled={saving}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" type="submit" disabled={saving} leftIcon={saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Award className="w-3.5 h-3.5" />}>
                {saving ? 'Publishing…' : 'Publish evaluation'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

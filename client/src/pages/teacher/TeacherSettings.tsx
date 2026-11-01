import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../contexts/ToastContext';

export const TeacherSettings: React.FC = () => {
  const [autoGrading, setAutoGrading] = useState(true);
  const [plagiarismCheck, setPlagiarismCheck] = useState(true);
  const [notifyOnSubmission, setNotifyOnSubmission] = useState(true);
  const toast = useToast();

  const handleSave = () => {
    toast.success('Settings Saved', 'Faculty evaluation preferences updated.');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Settings className="w-5 h-5 text-teal-600" />
          <h1 className="text-xl sm:text-2xl font-bold text-navy-900 tracking-tight">
            Faculty Evaluation Settings
          </h1>
        </div>
        <p className="text-xs text-brand-muted">
          Configure automated compiler testing, plagiarism similarity thresholds, and notification rules
        </p>
      </div>

      <Card className="border border-slate-200/80">
        <CardHeader>
          <CardTitle>Grading & Assessment Policy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-xs">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={autoGrading}
              onChange={(e) => setAutoGrading(e.target.checked)}
              className="rounded border-slate-300 text-teal-600 focus:ring-teal-500/20"
            />
            <div>
              <span className="font-semibold text-navy-900 block">
                Automatic Test Suite Runner
              </span>
              <span className="text-brand-muted text-[11px]">
                Run student submissions against reference unit test vectors upon upload
              </span>
            </div>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={plagiarismCheck}
              onChange={(e) => setPlagiarismCheck(e.target.checked)}
              className="rounded border-slate-300 text-teal-600 focus:ring-teal-500/20"
            />
            <div>
              <span className="font-semibold text-navy-900 block">
                Source Code Similarity Analysis
              </span>
              <span className="text-brand-muted text-[11px]">
                Flag submissions with &gt; 80% abstract syntax tree token match against peers
              </span>
            </div>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={notifyOnSubmission}
              onChange={(e) => setNotifyOnSubmission(e.target.checked)}
              className="rounded border-slate-300 text-teal-600 focus:ring-teal-500/20"
            />
            <div>
              <span className="font-semibold text-navy-900 block">
                Instant Submission Alert Notifications
              </span>
              <span className="text-brand-muted text-[11px]">
                Receive instant bell notification whenever a student finishes an assignment
              </span>
            </div>
          </label>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button size="sm" variant="accent" onClick={handleSave}>
              Save Evaluation Policy
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLabStore } from '../../store/useLabStore';
import { FileCode2, Play, Download, Trash2, Clock, Sparkles } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../contexts/ToastContext';

export const StudentExperiments: React.FC = () => {
  const { savedExperiments, setCurrentCode, setCurrentLanguage } = useLabStore();
  const navigate = useNavigate();
  const toast = useToast();

  const handleOpenExperiment = (exp: any) => {
    setCurrentCode(exp.code);
    setCurrentLanguage(exp.language);
    navigate(`/student/labs/${exp.labId}`);
    toast.success('Loaded Experiment', `Loaded ${exp.title} into virtual editor.`);
  };

  const handleDownload = (exp: any) => {
    const blob = new Blob([exp.code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${exp.title.toLowerCase().replace(/\s+/g, '_')}.${exp.language === 'python' ? 'py' : 'cpp'}`;
    a.click();
    toast.info('File Downloaded', 'Source code saved to your local machine.');
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <FileCode2 className="w-5 h-5 text-primary" />
          <h1 className="text-xl sm:text-2xl font-bold text-navy-900 tracking-tight">
            My Saved Experiments
          </h1>
        </div>
        <p className="text-xs text-brand-muted">
          Your personal academic code portfolio with execution snapshots and benchmarks
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {savedExperiments.map((exp) => (
          <Card key={exp.id} className="border border-slate-200/80">
            <CardContent className="p-5 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="primary" size="sm" className="uppercase font-mono">
                    {exp.language}
                  </Badge>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(exp.updatedAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-navy-900">{exp.title}</h3>

                {/* Code Preview */}
                <pre className="mt-3 p-3 bg-navy-950 text-emerald-300 font-mono text-[11px] rounded-xl overflow-x-auto max-h-36 border border-navy-800">
                  {exp.code}
                </pre>

                {/* Stderr / Stdout snippet */}
                {exp.lastStdout && (
                  <div className="mt-3 p-2 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-mono text-slate-600 line-clamp-2">
                    {exp.lastStdout}
                  </div>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Download className="w-3.5 h-3.5" />}
                  onClick={() => handleDownload(exp)}
                >
                  Download Source
                </Button>

                <Button
                  size="sm"
                  variant="primary"
                  leftIcon={<Play className="w-3.5 h-3.5 fill-white" />}
                  onClick={() => handleOpenExperiment(exp)}
                >
                  Open in Workspace
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_LABS, MOCK_GUIDED_PRACTICALS } from '../../services/mockData';
import { MonacoWorkspace } from '../../components/labs/MonacoWorkspace';
import { GuidedPracticalPanel } from '../../components/labs/GuidedPracticalPanel';
import { SqlWorkspace } from '../../components/labs/SqlWorkspace';
import { CircuitWorkspace } from '../../components/labs/CircuitWorkspace';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  ArrowLeft,
  BookOpen,
  Code2,
  Sparkles,
  Share2,
  CheckCircle,
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

export const StudentLabDetail: React.FC = () => {
  const { labId } = useParams<{ labId: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const lab = MOCK_LABS.find((l) => l.id === labId) || MOCK_LABS[0];
  const practicals = MOCK_GUIDED_PRACTICALS[lab.id] || [];
  const currentPractical = practicals[0] || null;

  const [mode, setMode] = useState<'guided' | 'workspace'>(
    lab.id === 'lab-sql' || lab.id === 'lab-iot' ? 'workspace' : 'guided'
  );

  const [workspaceCode, setWorkspaceCode] = useState(
    currentPractical?.starterCode || `// LUMIO Lab: ${lab.name}\n// Blank Workspace\n`
  );

  const handleSubmitLab = (code: string, stdout: string) => {
    toast.success(
      'Practical Submitted!',
      'Your code and execution logs have been sent to your professor for evaluation.'
    );
  };

  return (
    <div className="space-y-4">
      {/* Lab Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
            onClick={() => navigate('/student/labs')}
          >
            Back to Labs
          </Button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-navy-900 tracking-tight">{lab.name}</h1>
              <Badge variant="aqua" size="sm">
                Active Lab
              </Badge>
            </div>
            <p className="text-xs text-brand-muted mt-0.5">{lab.tagline}</p>
          </div>
        </div>

        {/* Mode Switcher (Guided vs Workspace) - for coding labs */}
        {lab.id !== 'lab-sql' && lab.id !== 'lab-iot' && (
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setMode('guided')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === 'guided'
                  ? 'bg-white text-primary shadow-xs'
                  : 'text-brand-muted hover:text-navy-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Guided Practicals</span>
            </button>
            <button
              onClick={() => setMode('workspace')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                mode === 'workspace'
                  ? 'bg-white text-navy-900 shadow-xs'
                  : 'text-brand-muted hover:text-navy-900'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Open Workspace</span>
            </button>
          </div>
        )}
      </div>

      {/* Render specialized lab engines */}
      {lab.id === 'lab-sql' ? (
        <SqlWorkspace />
      ) : lab.id === 'lab-iot' ? (
        <CircuitWorkspace />
      ) : mode === 'guided' && currentPractical ? (
        /* Guided Mode: Split view with Instructions on Left, Monaco IDE on Right */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[800px]">
          <div className="lg:col-span-4 h-full">
            <GuidedPracticalPanel
              practical={currentPractical}
              onApplyStarterCode={() => {
                setWorkspaceCode(currentPractical.starterCode);
                toast.info('Starter Code Restored');
              }}
            />
          </div>
          <div className="lg:col-span-8 h-full">
            <MonacoWorkspace
              initialCode={workspaceCode}
              language={currentPractical.defaultLanguage}
              labTitle={lab.name}
              onCodeChange={setWorkspaceCode}
              onSubmitPractical={handleSubmitLab}
              isGuidedMode={true}
            />
          </div>
        </div>
      ) : (
        /* Open Workspace Mode: Full IDE */
        <div className="h-[800px]">
          <MonacoWorkspace
            initialCode={workspaceCode}
            language={lab.languages[0] || 'python'}
            labTitle={lab.name}
            onCodeChange={setWorkspaceCode}
            isGuidedMode={false}
          />
        </div>
      )}
    </div>
  );
};

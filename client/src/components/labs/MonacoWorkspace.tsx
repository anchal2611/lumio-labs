import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import {
  Play,
  Square,
  Save,
  RotateCcw,
  Share2,
  Users,
  CheckCircle,
  FileCode,
  Moon,
  Sun,
  Maximize2,
  Sparkles,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { TerminalPanel } from './TerminalPanel';
import { SupportedLanguage } from '../../types/lab';
import { executeCode } from '../../services/execution';
import { useToast } from '../../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';

interface MonacoWorkspaceProps {
  initialCode: string;
  language: SupportedLanguage;
  labTitle: string;
  onCodeChange?: (newCode: string) => void;
  onSubmitPractical?: (code: string, stdout: string) => void;
  isGuidedMode?: boolean;
}

export const MonacoWorkspace: React.FC<MonacoWorkspaceProps> = ({
  initialCode,
  language,
  labTitle,
  onCodeChange,
  onSubmitPractical,
  isGuidedMode = true,
}) => {
  const [code, setCode] = useState(initialCode);
  const [theme, setTheme] = useState<'vs-dark' | 'light'>('vs-dark');
  const [activeFile, setActiveFile] = useState('main');
  const [files, setFiles] = useState<Record<string, string>>({
    main: initialCode,
    helper: `// Helper functions & test harness\n// Language: ${language}\n`,
  });
  const [stdin, setStdin] = useState('');
  const [stdout, setStdout] = useState('');
  const [stderr, setStderr] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionTime, setExecutionTime] = useState(24);
  const [memoryUsage, setMemoryUsage] = useState(4120);

  const toast = useToast();
  const navigate = useNavigate();

  const handleEditorChange = (value: string | undefined) => {
    const updated = value || '';
    setCode(updated);
    setFiles((prev) => ({ ...prev, [activeFile]: updated }));
    if (onCodeChange) onCodeChange(updated);
  };

  const handleRun = async () => {
    setIsExecuting(true);
    setStdout('');
    setStderr('');

    try {
      const result = await executeCode(language, code, stdin);
      setStdout(result.stdout);
      setStderr(result.stderr);
      setExecutionTime(result.timeMs);
      setMemoryUsage(result.memoryKb);

      if (result.status === 'success') {
        toast.success('Execution Finished', `Code completed in ${result.timeMs}ms`);
      } else {
        toast.error('Execution Error', 'Check compiler or syntax output in terminal.');
      }
    } catch {
      setStderr('Failed to execute program. Execution service error.');
      toast.error('Execution Failed');
    } finally {
      setIsExecuting(false);
    }
  };

  const handleReset = () => {
    setCode(initialCode);
    setFiles((prev) => ({ ...prev, [activeFile]: initialCode }));
    setStdout('');
    setStderr('');
    toast.info('Workspace Reset', 'Code restored to original starter template.');
  };

  const handleSave = () => {
    toast.success('Experiment Saved', 'Workspace checkpoint saved to your personal portfolio.');
  };

  const handleSubmit = () => {
    if (onSubmitPractical) {
      onSubmitPractical(code, stdout);
    } else {
      toast.success('Submitted', 'Practical submitted to faculty evaluation portal.');
    }
  };

  const handleCollaborate = () => {
    navigate('/student/collaboration');
  };

  const getMonacoLang = (lang: SupportedLanguage): string => {
    switch (lang) {
      case 'cpp':
      case 'c':
        return 'cpp';
      case 'python':
        return 'python';
      case 'java':
        return 'java';
      case 'sql':
        return 'sql';
      case 'javascript':
        return 'javascript';
      case 'html':
        return 'html';
      default:
        return 'plaintext';
    }
  };

  const fileExtension = language === 'python' ? 'py' : language === 'cpp' || language === 'c' ? 'cpp' : language === 'java' ? 'java' : 'txt';

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200/80 shadow-subtle overflow-hidden">
      {/* Top Workspace Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-200/80 gap-3 flex-wrap">
        {/* Left: File Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {Object.keys(files).map((fileKey) => (
            <button
              key={fileKey}
              onClick={() => {
                setActiveFile(fileKey);
                setCode(files[fileKey]);
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                activeFile === fileKey
                  ? 'bg-white text-primary shadow-2xs border border-slate-200 font-semibold'
                  : 'text-brand-muted hover:text-navy-900 hover:bg-slate-200/50'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>{fileKey}.{fileExtension}</span>
            </button>
          ))}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'vs-dark' ? 'light' : 'vs-dark')}
            className="p-1.5 text-slate-500 hover:text-navy-900 rounded-lg hover:bg-slate-200/50 transition-colors"
            title="Toggle Editor Theme"
          >
            {theme === 'vs-dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
          </button>

          <Button
            size="sm"
            variant="ghost"
            leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            onClick={handleReset}
            title="Reset to starter code"
          >
            Reset
          </Button>

          <Button
            size="sm"
            variant="outline"
            leftIcon={<Save className="w-3.5 h-3.5" />}
            onClick={handleSave}
          >
            Save
          </Button>

          <Button
            size="sm"
            variant="outline"
            leftIcon={<Users className="w-3.5 h-3.5 text-teal-600" />}
            onClick={handleCollaborate}
          >
            Collaborate
          </Button>

          {isGuidedMode && (
            <Button
              size="sm"
              variant="accent"
              leftIcon={<CheckCircle className="w-3.5 h-3.5" />}
              onClick={handleSubmit}
            >
              Submit Lab
            </Button>
          )}

          <Button
            size="sm"
            variant="primary"
            isLoading={isExecuting}
            leftIcon={<Play className="w-3.5 h-3.5 fill-white" />}
            onClick={handleRun}
          >
            Run Program
          </Button>
        </div>
      </div>

      {/* Editor & Terminal Split Panel */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Monaco Editor Container */}
        <div className="flex-1 min-h-[360px] relative">
          <Editor
            height="100%"
            language={getMonacoLang(language)}
            value={code}
            theme={theme}
            onChange={handleEditorChange}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: "'JetBrains Mono', monospace",
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 4,
              wordWrap: 'on',
              formatOnPaste: true,
              formatOnType: true,
              smoothScrolling: true,
              cursorBlinking: 'smooth',
            }}
          />
        </div>

        {/* Resizable Terminal Panel */}
        <div className="h-56 shrink-0">
          <TerminalPanel
            stdout={stdout}
            stderr={stderr}
            isExecuting={isExecuting}
            onClear={() => {
              setStdout('');
              setStderr('');
            }}
            stdin={stdin}
            onStdinChange={setStdin}
            executionTimeMs={executionTime}
            memoryKb={memoryUsage}
          />
        </div>
      </div>
    </div>
  );
};

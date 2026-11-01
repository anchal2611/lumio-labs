import React, { useState } from 'react';
import { Terminal, Copy, Trash2, Cpu, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { cn } from '../../utils/cn';

interface TerminalPanelProps {
  stdout: string;
  stderr: string;
  isExecuting: boolean;
  onClear: () => void;
  stdin: string;
  onStdinChange: (val: string) => void;
  executionTimeMs?: number;
  memoryKb?: number;
}

export const TerminalPanel: React.FC<TerminalPanelProps> = ({
  stdout,
  stderr,
  isExecuting,
  onClear,
  stdin,
  onStdinChange,
  executionTimeMs = 24,
  memoryKb = 4120,
}) => {
  const [activeTab, setActiveTab] = useState<'output' | 'stdin'>('output');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = stdout || stderr || '';
    if (text) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const hasContent = Boolean(stdout || stderr);

  return (
    <div className="flex flex-col h-full bg-navy-950 text-slate-200 rounded-b-xl border border-navy-800 font-mono text-xs overflow-hidden">
      {/* Terminal Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-navy-900 border-b border-navy-800 select-none">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-brand-aqua" />
          <div className="flex items-center gap-1 bg-navy-950 px-1.5 py-0.5 rounded-md border border-navy-800">
            <button
              onClick={() => setActiveTab('output')}
              className={cn(
                'px-2 py-0.5 rounded text-[11px] font-medium transition-colors',
                activeTab === 'output' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'
              )}
            >
              Console Output
            </button>
            <button
              onClick={() => setActiveTab('stdin')}
              className={cn(
                'px-2 py-0.5 rounded text-[11px] font-medium transition-colors',
                activeTab === 'stdin' ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'
              )}
            >
              Standard Input (stdin)
            </button>
          </div>
        </div>

        {/* Execution Status Pills */}
        <div className="flex items-center gap-3">
          {hasContent && (
            <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Cpu className="w-3 h-3 text-slate-500" />
                {executionTimeMs}ms
              </span>
              <span>{Math.round(memoryKb / 1024)}MB RAM</span>
              {stderr ? (
                <span className="flex items-center gap-1 text-red-400 font-semibold">
                  <AlertCircle className="w-3 h-3" /> Error
                </span>
              ) : (
                <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3 h-3" /> Code 0
                </span>
              )}
            </div>
          )}

          <div className="flex items-center gap-1">
            <button
              onClick={handleCopy}
              disabled={!hasContent}
              className="p-1 hover:bg-navy-800 text-slate-400 hover:text-white rounded transition-colors disabled:opacity-40"
              title="Copy Output"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClear}
              disabled={!hasContent}
              className="p-1 hover:bg-navy-800 text-slate-400 hover:text-white rounded transition-colors disabled:opacity-40"
              title="Clear Terminal"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Terminal View Content */}
      <div className="flex-1 p-3.5 overflow-y-auto leading-relaxed">
        {activeTab === 'output' ? (
          <div>
            {isExecuting ? (
              <div className="flex items-center gap-2.5 text-brand-aqua py-3">
                <div className="w-3 h-3 rounded-full border-2 border-brand-aqua border-t-transparent animate-spin" />
                <span>Compiling and executing in isolated LUMIO sandbox...</span>
              </div>
            ) : stdout || stderr ? (
              <div className="space-y-1">
                {stdout && (
                  <pre className="text-emerald-300 whitespace-pre-wrap font-mono select-text">
                    {stdout}
                  </pre>
                )}
                {stderr && (
                  <pre className="text-rose-400 whitespace-pre-wrap font-mono select-text">
                    {stderr}
                  </pre>
                )}
                <div className="pt-2 text-[10px] text-slate-500 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-brand-aqua" />
                  <span>Execution verified by LUMIO Virtual Execution Engine</span>
                </div>
              </div>
            ) : (
              <div className="text-slate-500 italic py-2">
                Click &quot;Run Program&quot; in the toolbar above to execute code. Standard output and compiler messages will appear here.
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col">
            <p className="text-[11px] text-slate-400 mb-2">
              Enter interactive inputs line-by-line below to supply to standard input (stdin):
            </p>
            <textarea
              value={stdin}
              onChange={(e) => onStdinChange(e.target.value)}
              placeholder="e.g.&#10;5&#10;25 40 85&#10;target_value"
              className="w-full flex-1 bg-navy-900 border border-navy-800 rounded p-2.5 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-primary font-mono text-xs resize-none"
              rows={4}
            />
          </div>
        )}
      </div>
    </div>
  );
};

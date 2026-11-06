import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MonacoEditor from '@monaco-editor/react';
import { ChevronRight, Loader2, ArrowLeft, Lightbulb, CheckCircle2, Play, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { apiGet, apiPost, getToken } from '../../services/api';
import { config } from '../../config/env';

interface Exercise {
  id: string; order: number; title: string; description: string;
  starterCode: string; expectedOutput: string; hints: string[]; points: number;
}
interface LabModule {
  id: string; title: string; description: string; category: string;
  difficulty: string; language: string; teacher_name: string;
  class: { name: string } | null; exercises: Exercise[];
}

export const StudentLabDetail: React.FC = () => {
  const { labId } = useParams<{ labId: string }>();
  const navigate = useNavigate();
  const [lab, setLab] = useState<LabModule | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeExIdx, setActiveExIdx] = useState(0);
  const [codes, setCodes] = useState<Record<string, string>>({});
  const [outputs, setOutputs] = useState<Record<string, string>>({});
  const [running, setRunning] = useState<string | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [showHints, setShowHints] = useState(false);

  useEffect(() => {
    apiGet<LabModule>(`/labs/${labId}`)
      .then((data) => {
        setLab(data);
        const initCodes: Record<string, string> = {};
        data.exercises.forEach(ex => { initCodes[ex.id] = ex.starterCode || ''; });
        setCodes(initCodes);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [labId]);

  const activeEx = lab?.exercises[activeExIdx];

  const runCode = async () => {
    if (!activeEx) return;
    setRunning(activeEx.id);
    try {
      const res = await fetch(`${config.apiBaseUrl}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ language: lab?.language || 'python', code: codes[activeEx.id] || activeEx.starterCode }),
      });
      const data = await res.json();
      const out = data.stdout || data.stderr || '[No output]';
      setOutputs(prev => ({ ...prev, [activeEx.id]: out }));

      // Auto-mark as complete if output matches expected
      if (activeEx.expectedOutput && out.trim() === activeEx.expectedOutput.trim()) {
        setCompleted(prev => new Set([...prev, activeEx.id]));
      }
    } catch {
      setOutputs(prev => ({ ...prev, [activeEx.id]: 'Execution failed.' }));
    } finally {
      setRunning(null);
    }
  };

  const markComplete = (exId: string) => {
    setCompleted(prev => { const n = new Set(prev); n.has(exId) ? n.delete(exId) : n.add(exId); return n; });
  };

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 text-blue-400 animate-spin" /></div>;
  if (!lab) return <div className="p-6 text-red-400">Lab not found.</div>;

  const monacoLang = (l: string) => l === 'cpp' ? 'cpp' : l;

  return (
    <div className="flex h-full overflow-hidden">
      {/* Sidebar */}
      <div className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0">
        {/* Header */}
        <div className="p-4 border-b border-slate-800">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-slate-400 hover:text-white mb-3 text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <h2 className="text-white font-bold text-sm leading-tight">{lab.title}</h2>
          <p className="text-slate-500 text-xs mt-1 capitalize">{lab.category} • {lab.difficulty} • {lab.language}</p>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 bg-slate-800 rounded-full h-1.5">
              <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${(completed.size / lab.exercises.length) * 100}%` }} />
            </div>
            <span className="text-xs text-slate-400">{completed.size}/{lab.exercises.length}</span>
          </div>
        </div>

        {/* Exercise list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {lab.exercises.map((ex, idx) => (
            <button
              key={ex.id}
              onClick={() => { setActiveExIdx(idx); setShowHints(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${activeExIdx === idx ? 'bg-blue-600/20 border border-blue-500/40 text-blue-300' : 'hover:bg-slate-800 text-slate-400 hover:text-white border border-transparent'}`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${completed.has(ex.id) ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
                {completed.has(ex.id) ? '✓' : idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{ex.title || `Exercise ${idx + 1}`}</p>
                <p className="text-xs text-slate-500">{ex.points} pts</p>
              </div>
              {activeExIdx === idx && <ChevronRight className="w-4 h-4 flex-shrink-0" />}
            </button>
          ))}
        </div>
      </div>

      {/* Main Area */}
      {activeEx && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top bar */}
          <div className="flex items-center justify-between px-5 py-3 bg-slate-900 border-b border-slate-800 flex-shrink-0">
            <div>
              <h3 className="text-white font-semibold">{activeEx.title}</h3>
              <p className="text-slate-500 text-xs">{activeEx.points} points</p>
            </div>
            <div className="flex items-center gap-2">
              {activeEx.hints.length > 0 && (
                <button onClick={() => setShowHints(!showHints)} className="flex items-center gap-1.5 text-sm text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-lg transition-all">
                  <Lightbulb className="w-4 h-4" /> Hints
                </button>
              )}
              <button onClick={() => markComplete(activeEx.id)} className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-all ${completed.has(activeEx.id) ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
                <CheckCircle2 className="w-4 h-4" /> {completed.has(activeEx.id) ? 'Completed' : 'Mark Done'}
              </button>
              <button onClick={runCode} disabled={!!running} className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-900 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-all">
                {running === activeEx.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                {running === activeEx.id ? 'Running...' : 'Run'}
              </button>
            </div>
          </div>

          {/* Task description */}
          <div className="px-5 py-3 bg-slate-950/50 border-b border-slate-800 flex-shrink-0">
            <p className="text-slate-300 text-sm">{activeEx.description}</p>
            {showHints && activeEx.hints.length > 0 && (
              <div className="mt-3 p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                <p className="text-xs font-semibold text-amber-400 mb-2">💡 Hints</p>
                <ul className="space-y-1">
                  {activeEx.hints.map((h, i) => <li key={i} className="text-sm text-amber-200/70">• {h}</li>)}
                </ul>
              </div>
            )}
          </div>

          {/* Editor */}
          <div className="flex-1 overflow-hidden">
            <MonacoEditor
              height="100%"
              language={monacoLang(lab.language)}
              value={codes[activeEx.id] || activeEx.starterCode}
              onChange={(val) => setCodes(prev => ({ ...prev, [activeEx.id]: val || '' }))}
              theme="vs-dark"
              options={{ fontSize: 14, minimap: { enabled: false }, automaticLayout: true, wordWrap: 'on' }}
            />
          </div>

          {/* Output */}
          {outputs[activeEx.id] && (
            <div className="h-36 bg-slate-950 border-t border-slate-800 p-4 overflow-auto flex-shrink-0">
              <p className="text-xs text-slate-500 mb-2 font-mono">▶ Output</p>
              <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap">{outputs[activeEx.id]}</pre>
              {activeEx.expectedOutput && (
                <div className="mt-2 pt-2 border-t border-slate-800">
                  <p className="text-xs text-slate-600">Expected: <span className="font-mono text-slate-500">{activeEx.expectedOutput}</span></p>
                </div>
              )}
            </div>
          )}

          {/* Navigate exercises */}
          <div className="flex items-center justify-between px-5 py-3 bg-slate-900 border-t border-slate-800 flex-shrink-0">
            <button disabled={activeExIdx === 0} onClick={() => setActiveExIdx(i => i - 1)} className="text-sm text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">← Previous</button>
            <span className="text-xs text-slate-500">{activeExIdx + 1} / {lab.exercises.length}</span>
            <button disabled={activeExIdx === lab.exercises.length - 1} onClick={() => setActiveExIdx(i => i + 1)} className="text-sm text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors">Next →</button>
          </div>
        </div>
      )}
    </div>
  );
};

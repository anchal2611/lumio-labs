import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MonacoEditor from '@monaco-editor/react';
import {
  ChevronRight,
  Loader2,
  ArrowLeft,
  Lightbulb,
  CheckCircle2,
  Play,
  Terminal,
  RotateCcw,
  BookOpen,
  Code2,
  Sparkles,
  Download,
  AlertCircle,
  Box,
  Maximize2,
} from 'lucide-react';
import { apiGet, apiPost } from '../../services/api';
import { config } from '../../config/env';
import { MOCK_LABS, MOCK_GUIDED_PRACTICALS } from '../../services/mockData';
import { SqlWorkspace } from '../../components/labs/SqlWorkspace';
import { CircuitWorkspace } from '../../components/labs/CircuitWorkspace';
import { GuidedPracticalPanel } from '../../components/labs/GuidedPracticalPanel';
import { MonacoWorkspace } from '../../components/labs/MonacoWorkspace';
import { Lab3DModelViewer, ModelPresetType } from '../../components/labs/Lab3DModelViewer';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../contexts/ToastContext';

export function getModelPresetForLab(lab: { id?: string; category?: string; title?: string; name?: string; description?: string } | null | undefined): ModelPresetType {
  if (!lab) return 'microcontroller';
  const text = `${lab.id || ''} ${lab.category || ''} ${lab.title || ''} ${lab.name || ''} ${lab.description || ''}`.toLowerCase();

  // 1. Robotics / Kinematics / Manipulator / Mechatronics
  if (text.includes('robot') || text.includes('kinematic') || text.includes('arm') || text.includes('motor') || text.includes('servo') || text.includes('actuator') || text.includes('automation')) {
    return 'robotics';
  }

  // 2. DNA / Bioinformatics / Biotech / Genetics / Molecular / Biology
  if (text.includes('dna') || text.includes('bio') || text.includes('genom') || text.includes('helix') || text.includes('molecul') || text.includes('sequence') || text.includes('crispr')) {
    return 'dna';
  }

  // 3. IoT / Microcontroller / Embedded / ESP32 / Arduino / Sensor / Telemetry / Circuit
  if (text.includes('iot') || text.includes('esp32') || text.includes('arduino') || text.includes('embed') || text.includes('microcontroller') || text.includes('mcu') || text.includes('telemetry') || text.includes('circuit') || text.includes('sensor')) {
    return 'microcontroller';
  }

  // 4. CPU / Hardware / Architecture / Systems / OS / Cache / Low-level / C / C++ / DSA / Assembly
  if (text.includes('cpu') || text.includes('arch') || text.includes('hardware') || text.includes('chip') || text.includes('silicon') || text.includes('cpp') || text.includes('c++') || text.includes('dsa') || text.includes('system') || text.includes('os') || text.includes('processor')) {
    return 'cpu';
  }

  return 'microcontroller';
}

interface Exercise {
  id: string;
  order: number;
  title: string;
  description: string;
  starterCode: string;
  expectedOutput: string;
  hints: string[];
  points: number;
}

interface DbLabModule {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  language: string;
  teacher_name?: string;
  class?: { name: string } | null;
  exercises: Exercise[];
}

export const StudentLabDetail: React.FC = () => {
  const { labId } = useParams<{ labId: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  // Check if it's one of the built-in university mock labs
  const mockLab = MOCK_LABS.find((l) => l.id === labId);

  // State for database-backed lab module
  const [dbLab, setDbLab] = useState<DbLabModule | null>(null);
  const [loadingDb, setLoadingDb] = useState(Boolean(!mockLab && labId));
  const [loadError, setLoadError] = useState('');
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [activeExIdx, setActiveExIdx] = useState(0);
  const [codes, setCodes] = useState<Record<string, string>>({});
  const [outputs, setOutputs] = useState<Record<string, { stdout: string; stderr: string; timeMs?: number; provider?: string }>>({});
  const [running, setRunning] = useState<string | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [showHints, setShowHints] = useState(false);

  // View mode: code only, split with 3D model, or 3D model only
  const [viewMode, setViewMode] = useState<'code' | 'split' | '3d'>('split');
  const [iotViewTab, setIotViewTab] = useState<'3d' | 'breadboard'>('3d');

  // State for mock guided/workspace lab mode
  const [guidedMode, setGuidedMode] = useState<'guided' | 'workspace'>('guided');
  const practicals = mockLab ? MOCK_GUIDED_PRACTICALS[mockLab.id] || [] : [];
  const currentPractical = practicals[0] || null;
  const [mockWorkspaceCode, setMockWorkspaceCode] = useState(
    currentPractical?.starterCode || (mockLab ? `// LUMIO Virtual Lab: ${mockLab.name}\n// Write your code below\n` : '')
  );

  useEffect(() => {
    if (mockLab || !labId) {
      setLoadingDb(false);
      setLoadError('');
      setDbLab(null);
      return;
    }

    let isCurrentRequest = true;
    setLoadingDb(true);
    setLoadError('');
    setDbLab(null);

    apiGet<DbLabModule>(`/labs/${encodeURIComponent(labId)}`)
      .then((data) => {
        if (!isCurrentRequest) return;
        setDbLab(data);
        const initCodes: Record<string, string> = {};
        data.exercises?.forEach((ex) => {
          initCodes[ex.id] = ex.starterCode || '';
        });
        setCodes(initCodes);
      })
      .catch((err: unknown) => {
        if (!isCurrentRequest) return;
        setLoadError(err instanceof Error ? err.message : 'Unable to load this lab. Please try again.');
      })
      .finally(() => {
        if (isCurrentRequest) setLoadingDb(false);
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [labId, mockLab, loadAttempt]);

  // 1. Specialized Engine: SQL Lab
  if (labId === 'lab-sql') {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
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
                <h1 className="text-lg font-bold text-navy-900 tracking-tight">Database & SQL Systems Lab</h1>
                <Badge variant="aqua" size="sm">Interactive Engine</Badge>
              </div>
              <p className="text-xs text-brand-muted mt-0.5">Relational algebra, multi-table joins, and query profiling</p>
            </div>
          </div>
        </div>
        <SqlWorkspace />
      </div>
    );
  }

  // 2. Specialized Engine: IoT Circuit Lab
  if (labId === 'lab-iot') {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
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
                <h1 className="text-lg font-bold text-navy-900 tracking-tight">IoT & Embedded Systems Breadboard</h1>
                <Badge variant="primary" size="sm">Hardware Simulator</Badge>
              </div>
              <p className="text-xs text-brand-muted mt-0.5">ESP32 microcontroller, sensors, actuators, and serial telemetry</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setIotViewTab('3d')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                iotViewTab === '3d'
                  ? 'bg-navy-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-navy-900'
              }`}
            >
              3D ESP32 MCU & Models
            </button>
            <button
              onClick={() => setIotViewTab('breadboard')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                iotViewTab === 'breadboard'
                  ? 'bg-navy-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-navy-900'
              }`}
            >
              2D Circuit Breadboard
            </button>
          </div>
        </div>

        {iotViewTab === '3d' ? (
          <div className="h-[780px] rounded-xl overflow-hidden border border-slate-200 shadow-subtle">
            <Lab3DModelViewer
              key="mock-lab-iot-esp32-3d"
              initialPreset="microcontroller"
              title="ESP32 Virtual Microcontroller & Custom 3D Model Explorer"
            />
          </div>
        ) : (
          <CircuitWorkspace />
        )}
      </div>
    );
  }

  // 3. Built-in University Coding Labs (Python, C++, Web, etc.)
  if (mockLab) {
    return (
      <div className="space-y-4">
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
                <h1 className="text-lg font-bold text-navy-900 tracking-tight">{mockLab.name}</h1>
                <Badge variant="aqua" size="sm">Interactive Lab</Badge>
              </div>
              <p className="text-xs text-brand-muted mt-0.5">{mockLab.tagline}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* View Mode Toggle: Code, Split with 3D, or 3D Only */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode('code')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'code' ? 'bg-white text-navy-900 shadow-xs' : 'text-brand-muted hover:text-navy-900'
                }`}
                title="Code Only"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Code Only</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('split')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === 'split' ? 'bg-white text-primary shadow-xs' : 'text-brand-muted hover:text-navy-900'
                }`}
                title="Split View: Code + 3D Model on Right"
              >
                <Box className="w-3.5 h-3.5 text-blue-600" />
                <span>Split + 3D Model</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('3d')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === '3d' ? 'bg-white text-primary shadow-xs' : 'text-brand-muted hover:text-navy-900'
                }`}
                title="3D Model Full View"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>3D Model</span>
              </button>
            </div>

            {currentPractical && (
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setGuidedMode('guided')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    guidedMode === 'guided'
                      ? 'bg-white text-primary shadow-xs'
                      : 'text-brand-muted hover:text-navy-900'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Guided Practicals</span>
                </button>
                <button
                  onClick={() => setGuidedMode('workspace')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    guidedMode === 'workspace'
                      ? 'bg-white text-navy-900 shadow-xs'
                      : 'text-brand-muted hover:text-navy-900'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Workspace</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {guidedMode === 'guided' && currentPractical ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[760px]">
            <div className="lg:col-span-4 h-full">
              <GuidedPracticalPanel
                practical={currentPractical}
                onApplyStarterCode={() => {
                  setMockWorkspaceCode(currentPractical.starterCode);
                  toast.info('Starter Code Restored');
                }}
              />
            </div>
            <div className="lg:col-span-8 h-full flex overflow-hidden gap-3">
              {viewMode !== '3d' && (
                <div className={`h-full ${viewMode === 'split' ? 'w-1/2' : 'w-full'}`}>
                  <MonacoWorkspace
                    initialCode={mockWorkspaceCode}
                    language={currentPractical.defaultLanguage}
                    labTitle={mockLab.name}
                    onCodeChange={setMockWorkspaceCode}
                    onSubmitPractical={() => toast.success('Practical Evaluation Submitted!')}
                    isGuidedMode={true}
                  />
                </div>
              )}
              {viewMode !== 'code' && (
                <div className={`h-full ${viewMode === 'split' ? 'w-1/2' : 'w-full'}`}>
                  <Lab3DModelViewer
                    key={`mock-guided-${mockLab.id}-${getModelPresetForLab(mockLab)}`}
                    initialPreset={getModelPresetForLab(mockLab)}
                    title={`${mockLab.name} — 3D Visualizer`}
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-[760px] flex overflow-hidden gap-3">
            {viewMode !== '3d' && (
              <div className={`h-full ${viewMode === 'split' ? 'w-1/2' : 'w-full'}`}>
                <MonacoWorkspace
                  initialCode={mockWorkspaceCode}
                  language={(mockLab.languages?.[0] as any) || 'python'}
                  labTitle={mockLab.name}
                  onCodeChange={setMockWorkspaceCode}
                  isGuidedMode={false}
                />
              </div>
            )}
            {viewMode !== 'code' && (
              <div className={`h-full ${viewMode === 'split' ? 'w-1/2' : 'w-full'}`}>
                <Lab3DModelViewer
                  key={`mock-ws-${mockLab.id}-${getModelPresetForLab(mockLab)}`}
                  initialPreset={getModelPresetForLab(mockLab)}
                  title={`${mockLab.name} — 3D Workspace`}
                />
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // 4. Loading state for Database Lab
  if (loadingDb) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] gap-3">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-sm text-slate-500 font-medium">Loading virtual laboratory...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto flex min-h-[360px] max-w-xl flex-col items-center justify-center text-center">
        <div className="mb-4 rounded-full bg-amber-50 p-3 text-amber-700">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h1 className="text-lg font-semibold text-navy-900">This lab could not be opened</h1>
        <p role="alert" className="mt-2 text-sm text-brand-muted">{loadError}</p>
        <div className="mt-5 flex gap-2">
          <Button variant="outline" onClick={() => navigate('/student/labs')}>Back to labs</Button>
          <Button onClick={() => setLoadAttempt((attempt) => attempt + 1)}>Try again</Button>
        </div>
      </div>
    );
  }

  if (dbLab && (!dbLab.exercises || dbLab.exercises.length === 0)) {
    return (
      <div className="mx-auto flex min-h-[360px] max-w-xl flex-col items-center justify-center text-center">
        <div className="mb-4 rounded-full bg-blue-50 p-3 text-primary">
          <BookOpen className="h-6 w-6" />
        </div>
        <h1 className="text-lg font-semibold text-navy-900">{dbLab.title}</h1>
        <p className="mt-2 text-sm text-brand-muted">This lab is published, but the instructor has not added any exercises yet.</p>
        <Button className="mt-5" variant="outline" onClick={() => navigate('/student/labs')}>Back to labs</Button>
      </div>
    );
  }

  // 5. Database-Backed Teacher Lab Module with Dynamic Exercises
  if (dbLab && dbLab.exercises && dbLab.exercises.length > 0) {
    const activeEx = dbLab.exercises[activeExIdx] || dbLab.exercises[0];
    const currentCode = codes[activeEx.id] ?? activeEx.starterCode ?? '';
    const currentOut = outputs[activeEx.id];

    const runExerciseCode = async () => {
      setRunning(activeEx.id);
      try {
        const res = await apiPost<{
          stdout?: string;
          stderr?: string;
          timeMs?: number;
          provider?: string;
        }>('/execute', {
          language: dbLab.language,
          code: currentCode,
        });
        setOutputs((prev) => ({
          ...prev,
          [activeEx.id]: {
            stdout: res.stdout || '',
            stderr: res.stderr || '',
            timeMs: res.timeMs,
            provider: res.provider,
          },
        }));
      } catch (err) {
        setOutputs((prev) => ({
          ...prev,
          [activeEx.id]: {
            stdout: '',
            stderr: err instanceof Error ? err.message : 'Execution failed.',
          },
        }));
      } finally {
        setRunning(null);
      }
    };

    const monacoLang = (l: string) => (l === 'cpp' ? 'cpp' : l);

    return (
      <div className="flex h-[800px] bg-slate-950 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
        {/* Left Exercises Sidebar */}
        <div className="w-72 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-800">
            <button
              onClick={() => navigate('/student/labs')}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 mb-2.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Labs
            </button>
            <h2 className="text-white font-bold text-base leading-snug">{dbLab.title}</h2>
            <p className="text-slate-400 text-xs mt-1 capitalize">
              {dbLab.category} • {dbLab.difficulty} • {dbLab.language}
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-brand-aqua h-full rounded-full transition-all duration-300"
                  style={{ width: `${(completed.size / dbLab.exercises.length) * 100}%` }}
                />
              </div>
              <span className="text-xs text-slate-400 font-mono font-medium">
                {completed.size}/{dbLab.exercises.length} Done
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {dbLab.exercises.map((ex, idx) => (
              <button
                key={ex.id}
                onClick={() => {
                  setActiveExIdx(idx);
                  setShowHints(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                  activeExIdx === idx
                    ? 'bg-primary/20 border border-primary/50 text-white'
                    : 'hover:bg-slate-800/60 text-slate-400 hover:text-white border border-transparent'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                    completed.has(ex.id) ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {completed.has(ex.id) ? '✓' : idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">{ex.title || `Exercise ${idx + 1}`}</p>
                  <p className="text-[11px] text-slate-500">{ex.points} points</p>
                </div>
                {activeExIdx === idx && <ChevronRight className="w-4 h-4 shrink-0 text-brand-aqua" />}
              </button>
            ))}
          </div>
        </div>

        {/* Right Workspace: Monaco Code Editor + 3D Interactive Model Panel */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Exercise Bar */}
          <div className="flex items-center justify-between px-5 py-3 bg-slate-900 border-b border-slate-800 shrink-0 flex-wrap gap-2">
            <div>
              <h3 className="text-white font-bold text-sm">{activeEx.title}</h3>
              <p className="text-slate-400 text-xs mt-0.5">{activeEx.description}</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* View Mode Toggle: Code, Split with 3D, or 3D Only */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => setViewMode('code')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                    viewMode === 'code' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Code Only"
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Code</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('split')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                    viewMode === 'split' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Split Screen: Code + 3D Model on Right"
                >
                  <Box className="w-3.5 h-3.5 text-blue-400" />
                  <span className="hidden sm:inline">Split (3D)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('3d')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                    viewMode === '3d' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                  title="3D Model Full View"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">3D View</span>
                </button>
              </div>

              {activeEx.hints && activeEx.hints.length > 0 && (
                <button
                  onClick={() => setShowHints(!showHints)}
                  className="flex items-center gap-1.5 text-xs text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-lg border border-amber-500/30 transition-all"
                >
                  <Lightbulb className="w-3.5 h-3.5" /> Hints ({activeEx.hints.length})
                </button>
              )}
              <button
                onClick={() => {
                  setCompleted((prev) => {
                    const n = new Set(prev);
                    n.has(activeEx.id) ? n.delete(activeEx.id) : n.add(activeEx.id);
                    return n;
                  });
                }}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all border ${
                  completed.has(activeEx.id)
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 hover:text-white border-slate-700'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {completed.has(activeEx.id) ? 'Completed' : 'Mark Done'}
              </button>
              <button
                onClick={runExerciseCode}
                disabled={Boolean(running)}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
              >
                {running === activeEx.id ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-white" />
                )}
                {running === activeEx.id ? 'Running...' : 'Run Code'}
              </button>
            </div>
          </div>

          {/* Hints Banner */}
          {showHints && activeEx.hints && activeEx.hints.length > 0 && (
            <div className="px-5 py-2.5 bg-amber-500/10 border-b border-amber-500/20 text-xs text-amber-200">
              <span className="font-bold text-amber-300">💡 Hint: </span>
              {activeEx.hints.join(' • ')}
            </div>
          )}

          {/* Split / Unified Workspace View */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left Portion: Code Editor & Console (Hidden if viewMode === '3d') */}
            {viewMode !== '3d' && (
              <div className={`flex flex-col h-full overflow-hidden min-w-0 ${viewMode === 'split' ? 'w-1/2 border-r border-slate-800' : 'w-full'}`}>
                {/* Monaco Code Editor */}
                <div className="flex-1 overflow-hidden relative">
                  <MonacoEditor
                    height="100%"
                    language={monacoLang(dbLab.language)}
                    value={currentCode}
                    onChange={(val) => setCodes((prev) => ({ ...prev, [activeEx.id]: val || '' }))}
                    theme="vs-dark"
                    options={{
                      fontSize: 13,
                      minimap: { enabled: false },
                      automaticLayout: true,
                      wordWrap: 'on',
                      fontFamily: 'JetBrains Mono, monospace',
                    }}
                  />
                </div>

                {/* Always Visible Output Console */}
                <div className="h-56 bg-slate-950 border-t border-slate-800 flex flex-col shrink-0">
                  <div className="flex items-center justify-between px-4 py-1.5 bg-slate-900 border-b border-slate-800 text-xs">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-3.5 h-3.5 text-brand-aqua" />
                      <span className="font-mono text-slate-300 font-semibold">Console Output</span>
                      {currentOut?.timeMs && (
                        <span className="text-[10px] text-slate-500 font-mono">({currentOut.timeMs}ms)</span>
                      )}
                      {currentOut?.provider && (
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                          {currentOut.provider}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {activeEx.expectedOutput && (
                        <span className="text-[11px] text-slate-400">
                          Expected: <span className="font-mono text-slate-200">{activeEx.expectedOutput}</span>
                        </span>
                      )}
                      <button
                        onClick={() => setOutputs((prev) => ({ ...prev, [activeEx.id]: { stdout: '', stderr: '' } }))}
                        className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                  </div>

                  <div className="flex-1 p-3 overflow-y-auto font-mono text-xs select-text">
                    {running === activeEx.id ? (
                      <div className="flex items-center gap-2 text-slate-400">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Executing program in sandbox...</span>
                      </div>
                    ) : currentOut ? (
                      <>
                        {currentOut.stdout && (
                          <pre className="text-emerald-400 whitespace-pre-wrap">{currentOut.stdout}</pre>
                        )}
                        {currentOut.stderr && (
                          <pre className="text-rose-400 whitespace-pre-wrap mt-1">{currentOut.stderr}</pre>
                        )}
                        {!currentOut.stdout && !currentOut.stderr && (
                          <p className="text-slate-600">[Program finished with no console output]</p>
                        )}
                      </>
                    ) : (
                      <p className="text-slate-600 italic">Click "Run Code" above to execute and inspect console output.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Right Portion: Interactive 3D Model Viewer */}
            {viewMode !== 'code' && (
              <div className={`h-full ${viewMode === 'split' ? 'w-1/2' : 'w-full'}`}>
                <Lab3DModelViewer
                  key={`db-${dbLab.id}-${getModelPresetForLab(dbLab)}`}
                  initialPreset={getModelPresetForLab(dbLab)}
                  title={`${dbLab.title} — 3D Laboratory Model`}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Fallback: Open Workspace
  return (
    <div className="h-[760px] flex overflow-hidden gap-3">
      {viewMode !== '3d' && (
        <div className={`h-full ${viewMode === 'split' ? 'w-1/2' : 'w-full'}`}>
          <MonacoWorkspace
            initialCode={`// LUMIO Virtual Laboratory Workspace\n// Write and execute code in any language\n\nprint("Hello from LUMIO!")\n`}
            language="python"
            labTitle="Virtual Sandbox Workspace"
            isGuidedMode={false}
          />
        </div>
      )}
      {viewMode !== 'code' && (
        <div className={`h-full ${viewMode === 'split' ? 'w-1/2' : 'w-full'}`}>
          <Lab3DModelViewer
            key="fallback-viewer"
            initialPreset="microcontroller"
            title="Interactive 3D Hardware Explorer"
          />
        </div>
      )}
    </div>
  );
};

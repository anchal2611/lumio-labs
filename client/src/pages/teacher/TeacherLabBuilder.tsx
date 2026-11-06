import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, ChevronDown, ChevronUp, ArrowLeft, FlaskConical, Loader2, Check } from 'lucide-react';
import { apiGet, apiPost } from '../../services/api';

interface Exercise {
  id: string; order: number; title: string; description: string;
  starterCode: string; expectedOutput: string; hints: string[]; points: number;
}

interface ClassItem { id: string; name: string; subject: string; }

const DEFAULT_EXERCISE: Omit<Exercise, 'id'> = {
  order: 1, title: '', description: '', starterCode: '# Write your code here\n', expectedOutput: '', hints: [], points: 10
};

export const TeacherLabBuilder: React.FC = () => {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [expandedExercise, setExpandedExercise] = useState<number>(0);

  const [form, setForm] = useState({
    title: '', description: '', category: 'programming', difficulty: 'beginner',
    language: 'python', classId: '', isPublished: false,
  });
  const [exercises, setExercises] = useState<Exercise[]>([
    { ...DEFAULT_EXERCISE, id: `ex_${Date.now()}`, order: 1 }
  ]);

  useEffect(() => {
    apiGet<{ classes: ClassItem[] }>('/classes').then(r => setClasses(r.classes)).catch(() => {});
  }, []);

  const addExercise = () => {
    const newEx: Exercise = { ...DEFAULT_EXERCISE, id: `ex_${Date.now()}`, order: exercises.length + 1, title: `Exercise ${exercises.length + 1}` };
    setExercises(prev => [...prev, newEx]);
    setExpandedExercise(exercises.length);
  };

  const removeExercise = (idx: number) => {
    setExercises(prev => prev.filter((_, i) => i !== idx).map((ex, i) => ({ ...ex, order: i + 1 })));
  };

  const updateExercise = (idx: number, updates: Partial<Exercise>) => {
    setExercises(prev => prev.map((ex, i) => i === idx ? { ...ex, ...updates } : ex));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title) return;
    setSaving(true);
    try {
      await apiPost('/labs', {
        ...form,
        classId: form.classId || undefined,
        exercises,
      });
      setSaved(true);
      setTimeout(() => navigate('/teacher/labs'), 1500);
    } catch (err: any) {
      alert(err.message || 'Failed to save lab module.');
    } finally {
      setSaving(false);
    }
  };

  const inputCls = 'w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all';

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Lab Module Builder</h1>
          <p className="text-slate-400 text-sm mt-0.5">Create a lab module with exercises for your students</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Module Details */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-blue-400" /> Module Details
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Module Title *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className={inputCls} placeholder="Python Fundamentals — Week 1" required />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Description</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className={`${inputCls} resize-none`} placeholder="Brief description of what students will learn..." />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className={inputCls}>
                  {['programming', 'electronics', 'networking', 'database', 'algorithms', 'other'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Difficulty</label>
                <select value={form.difficulty} onChange={e => setForm(f => ({ ...f, difficulty: e.target.value }))} className={inputCls}>
                  {['beginner', 'intermediate', 'advanced'].map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Language</label>
                <select value={form.language} onChange={e => setForm(f => ({ ...f, language: e.target.value }))} className={inputCls}>
                  {['python', 'javascript', 'cpp', 'c', 'java', 'sql'].map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Assign to Class</label>
                <select value={form.classId} onChange={e => setForm(f => ({ ...f, classId: e.target.value }))} className={inputCls}>
                  <option value="">None</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.isPublished} onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))} className="w-4 h-4 rounded" />
              <span className="text-sm text-slate-300">Publish immediately (make visible to students)</span>
            </label>
          </div>
        </div>

        {/* Exercises */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Exercises <span className="text-slate-500 text-sm font-normal ml-1">({exercises.length})</span></h2>
            <button type="button" onClick={addExercise} className="flex items-center gap-1.5 text-sm bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white px-3 py-2 rounded-xl transition-all">
              <Plus className="w-4 h-4" /> Add Exercise
            </button>
          </div>

          <div className="space-y-3">
            {exercises.map((ex, idx) => (
              <div key={ex.id} className="border border-slate-700/50 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedExercise(expandedExercise === idx ? -1 : idx)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-slate-800/50 hover:bg-slate-800 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold flex items-center justify-center">{idx + 1}</span>
                    <span className="text-white font-medium">{ex.title || `Exercise ${idx + 1}`}</span>
                    <span className="text-slate-500 text-sm">{ex.points} pts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {exercises.length > 1 && (
                      <span onClick={e => { e.stopPropagation(); removeExercise(idx); }} className="p-1 text-slate-500 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </span>
                    )}
                    {expandedExercise === idx ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </button>

                {expandedExercise === idx && (
                  <div className="p-4 space-y-4 bg-slate-900/50">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Exercise Title</label>
                        <input value={ex.title} onChange={e => updateExercise(idx, { title: e.target.value })} className={inputCls} placeholder="Hello World" />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Points</label>
                        <input type="number" value={ex.points} onChange={e => updateExercise(idx, { points: Number(e.target.value) })} className={inputCls} min={1} max={100} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Description / Task</label>
                      <textarea value={ex.description} onChange={e => updateExercise(idx, { description: e.target.value })} rows={3} className={`${inputCls} resize-none`} placeholder="Describe what the student needs to do..." />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Starter Code</label>
                      <textarea value={ex.starterCode} onChange={e => updateExercise(idx, { starterCode: e.target.value })} rows={5} className={`${inputCls} font-mono text-sm resize-none`} />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Expected Output</label>
                      <textarea value={ex.expectedOutput} onChange={e => updateExercise(idx, { expectedOutput: e.target.value })} rows={2} className={`${inputCls} font-mono text-sm resize-none`} placeholder="What the program should print..." />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Hints (one per line)</label>
                      <textarea
                        value={ex.hints.join('\n')}
                        onChange={e => updateExercise(idx, { hints: e.target.value.split('\n').filter(Boolean) })}
                        rows={2}
                        className={`${inputCls} resize-none`}
                        placeholder="Use print() function&#10;Variables don't need type declarations"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <button type="button" onClick={() => navigate(-1)} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all">Cancel</button>
          <button type="submit" disabled={saving || !form.title} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20">
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : saved ? <Check className="w-5 h-5 text-emerald-400" /> : <FlaskConical className="w-5 h-5" />}
            {saving ? 'Saving...' : saved ? 'Saved! Redirecting...' : 'Save Lab Module'}
          </button>
        </div>
      </form>
    </div>
  );
};

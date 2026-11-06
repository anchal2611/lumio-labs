import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, FlaskConical, Copy, Check, RefreshCw, BookOpen, ChevronRight, X, Loader2 } from 'lucide-react';
import { apiGet, apiPost, apiPatch } from '../../services/api';

const COLORS = ['#2563EB','#7C3AED','#059669','#DC2626','#D97706'];
const COLOR_NAMES: Record<string, string> = { '#2563EB': 'Blue', '#7C3AED': 'Purple', '#059669': 'Green', '#DC2626': 'Red', '#D97706': 'Amber' };

interface ClassItem {
  id: string; name: string; subject: string; description?: string;
  join_code: string; teacher_name: string; student_count: number;
  lab_count: number; banner_color: string; created_at: string;
}

export const TeacherClasses: React.FC = () => {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', subject: '', description: '', bannerColor: '#2563EB' });

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await apiGet<{ classes: ClassItem[] }>('/classes');
      setClasses(res.classes);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchClasses(); }, []);

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const regenerateCode = async (classId: string, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    try {
      const res = await apiPatch<{ joinCode: string }>(`/classes/${classId}/regenerate-code`);
      setClasses(cls => cls.map(c => c.id === classId ? { ...c, join_code: res.joinCode } : c));
    } catch { }
  };

  const createClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.subject) { setError('Name and subject are required.'); return; }
    setCreating(true); setError(null);
    try {
      await apiPost('/classes', form);
      setShowModal(false);
      setForm({ name: '', subject: '', description: '', bannerColor: '#2563EB' });
      fetchClasses();
    } catch (err: any) { setError(err.message); }
    finally { setCreating(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">My Classes</h1>
          <p className="text-slate-400 mt-1">Manage your classes and share join codes with students</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20">
          <Plus className="w-5 h-5" /> Create Class
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      ) : classes.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen className="w-14 h-14 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No classes yet</h3>
          <p className="text-slate-500 mb-6">Create your first class and share the join code with your students</p>
          <button onClick={() => setShowModal(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-medium transition-all">Create First Class</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {classes.map(cls => (
            <Link key={cls.id} to={`/teacher/classes/${cls.id}`} className="block group">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-600 transition-all duration-200 hover:shadow-xl">
                {/* Banner */}
                <div className="h-20 relative" style={{ backgroundColor: cls.banner_color + '33', borderBottom: `2px solid ${cls.banner_color}44` }}>
                  <div className="absolute inset-0 flex items-end p-4">
                    <div>
                      <h3 className="text-white font-bold text-lg leading-tight">{cls.name}</h3>
                      <p className="text-slate-300 text-sm">{cls.subject}</p>
                    </div>
                  </div>
                  <ChevronRight className="absolute top-4 right-4 w-5 h-5 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
                {/* Body */}
                <div className="p-4">
                  {cls.description && <p className="text-slate-500 text-sm mb-3 line-clamp-2">{cls.description}</p>}
                  <div className="flex items-center gap-4 text-sm text-slate-400 mb-3">
                    <span className="flex items-center gap-1.5"><Users className="w-4 h-4" />{cls.student_count} students</span>
                    <span className="flex items-center gap-1.5"><FlaskConical className="w-4 h-4" />{cls.lab_count} labs</span>
                  </div>
                  {/* Join code row */}
                  <div className="flex items-center justify-between bg-slate-800/50 rounded-xl px-3 py-2">
                    <div>
                      <p className="text-xs text-slate-500">Join Code</p>
                      <p className="text-white font-mono font-bold tracking-wider">{cls.join_code}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={(e) => { e.preventDefault(); copyCode(cls.join_code); }} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors" title="Copy code">
                        {copiedCode === cls.join_code ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                      <button onClick={(e) => regenerateCode(cls.id, e)} className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-700 rounded-lg transition-colors" title="Regenerate code">
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Class Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">Create New Class</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>}
            <form onSubmit={createClass} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Class Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" placeholder="CSE301 — Data Structures" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Subject Code *</label>
                <input value={form.subject} onChange={e => setForm(f => ({...f, subject: e.target.value}))} className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" placeholder="CSE301" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} rows={2} className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none" placeholder="Brief description..." />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-2">Banner Color</label>
                <div className="flex gap-2">
                  {COLORS.map(c => (
                    <button key={c} type="button" onClick={() => setForm(f => ({...f, bannerColor: c}))}
                      className={`w-8 h-8 rounded-lg transition-all ${form.bannerColor === c ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : 'hover:scale-105'}`}
                      style={{ backgroundColor: c }} title={COLOR_NAMES[c]} />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all">Cancel</button>
                <button type="submit" disabled={creating} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-semibold py-3 rounded-xl transition-all">
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherClasses;

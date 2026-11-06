import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Users, FlaskConical, ClipboardList, ChevronRight, Loader2, Copy, Check, RefreshCw, GraduationCap, BookOpen } from 'lucide-react';
import { apiGet, apiPatch } from '../../services/api';

interface ClassDetail {
  id: string; name: string; subject: string; description?: string;
  join_code: string; teacher: { name: string; email: string };
  students: any[]; labs: any[]; assignments: any[]; banner_color: string;
}

export const TeacherClassDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [cls, setCls] = useState<ClassDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'labs' | 'assignments' | 'students'>('labs');
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    apiGet<ClassDetail>(`/classes/${id}`)
      .then(setCls)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const copyCode = async () => {
    if (!cls?.join_code) return;
    await navigator.clipboard.writeText(cls.join_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const regenerateCode = async () => {
    if (!id) return;
    const res = await apiPatch<{ joinCode: string }>(`/classes/${id}/regenerate-code`);
    setCls(prev => prev ? { ...prev, join_code: res.joinCode } : null);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-blue-400 animate-spin" /></div>;
  if (!cls) return <div className="p-6 text-red-400">Class not found.</div>;

  return (
    <div className="space-y-6 max-w-5xl">
      <Link to="/teacher/classes" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Classes
      </Link>

      {/* Header */}
      <div className="rounded-2xl p-6 mb-6" style={{ background: `linear-gradient(135deg, ${cls.banner_color}20, ${cls.banner_color}08)`, border: `1px solid ${cls.banner_color}30` }}>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">{cls.name}</h1>
            <p className="text-slate-400 mb-3">{cls.subject}</p>
            {cls.description && <p className="text-slate-400 text-sm mb-4">{cls.description}</p>}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-400"><Users className="w-4 h-4" />{cls.students?.length || 0} students</div>
              <div className="flex items-center gap-2 text-sm text-slate-400"><FlaskConical className="w-4 h-4" />{cls.labs?.length || 0} labs</div>
            </div>
          </div>
          {/* Join Code */}
          <div className="bg-slate-900/80 rounded-xl p-4 text-right">
            <p className="text-xs text-slate-500 mb-1">Join Code</p>
            <p className="text-2xl font-mono font-black text-white tracking-widest mb-2">{cls.join_code}</p>
            <div className="flex items-center gap-2 justify-end">
              <button onClick={copyCode} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded-lg transition-all">
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />} Copy
              </button>
              <button onClick={regenerateCode} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded-lg transition-all">
                <RefreshCw className="w-3.5 h-3.5" /> New
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-900 p-1 rounded-xl mb-6 w-fit">
        {(['labs', 'assignments', 'students'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === tab ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'labs' && (
        <div className="space-y-3">
          <div className="flex justify-end">
            <Link to="/teacher/labs/new" className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl transition-all">+ Add Lab Module</Link>
          </div>
          {cls.labs?.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No lab modules yet. Add your first lab!</div>
          ) : cls.labs?.map((lab: any) => (
            <div key={lab.id} className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg"><FlaskConical className="w-5 h-5 text-blue-400" /></div>
                <div>
                  <p className="text-white font-medium">{lab.title}</p>
                  <p className="text-slate-500 text-sm capitalize">{lab.category} • {lab.difficulty} • {lab.language}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {lab.is_published ? (
                  <span className="text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-1 rounded-full">Published</span>
                ) : (
                  <span className="text-xs bg-slate-700 text-slate-400 px-2 py-1 rounded-full">Draft</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'assignments' && (
        <div className="space-y-3">
          {cls.assignments?.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No assignments yet.</div>
          ) : cls.assignments?.map((a: any) => (
            <div key={a.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white font-medium">{a.title}</p>
                  {a.due_date && <p className="text-slate-500 text-xs mt-1">Due: {new Date(a.due_date).toLocaleDateString()}</p>}
                </div>
                <span className="text-slate-400 text-sm">{a.max_marks} marks</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'students' && (
        <div className="space-y-2">
          {cls.students?.length === 0 ? (
            <div className="text-center py-12">
              <GraduationCap className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500">No students enrolled yet.</p>
              <p className="text-slate-600 text-sm mt-1">Share join code <span className="font-mono font-bold text-slate-400">{cls.join_code}</span> with your students.</p>
            </div>
          ) : cls.students?.map((s: any) => (
            <div key={s.id} className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {s.name?.[0]}
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">{s.name}</p>
                <p className="text-slate-500 text-xs">{s.email} {s.roll_number ? `• ${s.roll_number}` : ''} {s.branch ? `• ${s.branch}` : ''}</p>
              </div>
              <p className="text-slate-600 text-xs">{new Date(s.enrolled_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

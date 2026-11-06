import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Users, FlaskConical, BookOpen, ClipboardList, Copy, Check, Loader2, ChevronRight, Play } from 'lucide-react';
import { apiGet } from '../../services/api';

interface ClassDetail {
  id: string; name: string; subject: string; description?: string;
  join_code: string; teacher: { name: string; email: string };
  students: any[]; labs: any[]; assignments: any[]; banner_color: string;
}

export const StudentClassDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [cls, setCls] = useState<ClassDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'labs' | 'assignments' | 'members'>('labs');
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

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-blue-400 animate-spin" /></div>;
  if (!cls) return <div className="p-6 text-red-400">Class not found.</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <Link to="/student/classes" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Classes
      </Link>

      {/* Header */}
      <div className="rounded-2xl p-6 mb-6" style={{ background: `linear-gradient(135deg, ${cls.banner_color}20, ${cls.banner_color}08)`, border: `1px solid ${cls.banner_color}30` }}>
        <h1 className="text-2xl font-bold text-white mb-1">{cls.name}</h1>
        <p className="text-slate-400 mb-3">{cls.subject} • By {cls.teacher?.name}</p>
        {cls.description && <p className="text-slate-400 text-sm">{cls.description}</p>}
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-2 text-sm text-slate-400"><Users className="w-4 h-4" />{cls.students?.length || 0} students</div>
          <div className="flex items-center gap-2 text-sm text-slate-400"><FlaskConical className="w-4 h-4" />{cls.labs?.length || 0} labs</div>
          <div className="flex items-center gap-2 text-sm text-slate-400"><ClipboardList className="w-4 h-4" />{cls.assignments?.length || 0} assignments</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-900 p-1 rounded-xl mb-6 w-fit">
        {(['labs', 'assignments', 'members'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === tab ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'labs' && (
        <div className="space-y-3">
          {cls.labs?.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No lab modules yet</div>
          ) : cls.labs?.map((lab: any) => (
            <Link key={lab.id} to={`/student/labs/${lab.id}`}
              className="flex items-center justify-between bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-xl p-4 transition-all group">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg"><FlaskConical className="w-5 h-5 text-blue-400" /></div>
                <div>
                  <p className="text-white font-medium">{lab.title}</p>
                  <p className="text-slate-500 text-sm capitalize">{lab.category} • {lab.difficulty} • {lab.language}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white px-3 py-1.5 rounded-lg text-sm transition-all">
                  <Play className="w-3.5 h-3.5" /> Open
                </button>
                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {activeTab === 'assignments' && (
        <div className="space-y-3">
          {cls.assignments?.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No assignments yet</div>
          ) : cls.assignments?.map((a: any) => (
            <div key={a.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-white font-medium">{a.title}</p>
                  {a.description && <p className="text-slate-500 text-sm mt-1">{a.description}</p>}
                  {a.due_date && <p className="text-slate-500 text-xs mt-2">Due: {new Date(a.due_date).toLocaleDateString()}</p>}
                </div>
                <span className="text-slate-400 text-sm">{a.max_marks} marks</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'members' && (
        <div className="space-y-2">
          <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-sm">
              {cls.teacher?.name?.[0]}
            </div>
            <div>
              <p className="text-white font-medium">{cls.teacher?.name}</p>
              <p className="text-slate-500 text-xs">Teacher</p>
            </div>
          </div>
          {cls.students?.map((s: any) => (
            <div key={s.id} className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl p-4">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm">
                {s.name?.[0]}
              </div>
              <div>
                <p className="text-white font-medium">{s.name}</p>
                <p className="text-slate-500 text-xs">{s.roll_number} {s.branch ? `• ${s.branch}` : ''}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

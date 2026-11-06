import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, FlaskConical, ChevronRight, Hash, Loader2, CheckCircle2 } from 'lucide-react';
import { apiGet, apiPost } from '../../services/api';

interface ClassItem {
  id: string; name: string; subject: string; description?: string;
  teacher_name: string; student_count: number; lab_count: number;
  banner_color: string; created_at: string;
}

export const StudentClasses: React.FC = () => {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);
  const [joinSuccess, setJoinSuccess] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await apiGet<{ classes: ClassItem[] }>('/classes');
      setClasses(res.classes);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchClasses(); }, []);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setJoining(true); setJoinError(null); setJoinSuccess(null);
    try {
      const res = await apiPost<any>('/classes/join', { joinCode: joinCode.trim() });
      setJoinSuccess(res.message || `Joined ${res.class?.name}!`);
      setJoinCode('');
      fetchClasses();
    } catch (e: any) { setJoinError(e.message); }
    finally { setJoining(false); }
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">My Classes</h1>
        <p className="text-slate-400">Join classes using the code from your teacher</p>
      </div>

      {/* Join box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">
        <h2 className="text-white font-semibold mb-3 flex items-center gap-2"><Hash className="w-5 h-5 text-blue-400" /> Join a Class</h2>
        <form onSubmit={handleJoin} className="flex gap-3">
          <input
            value={joinCode}
            onChange={e => setJoinCode(e.target.value.toUpperCase())}
            className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all uppercase"
            placeholder="Enter join code (e.g. LUMIO01)"
            maxLength={10}
          />
          <button type="submit" disabled={joining || !joinCode.trim()} className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900 text-white font-semibold rounded-xl transition-all flex items-center gap-2">
            {joining ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {joining ? 'Joining...' : 'Join'}
          </button>
        </form>
        {joinSuccess && <div className="mt-3 flex items-center gap-2 text-emerald-400 text-sm"><CheckCircle2 className="w-4 h-4" />{joinSuccess}</div>}
        {joinError && <div className="mt-3 text-red-400 text-sm">{joinError}</div>}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40"><Loader2 className="w-8 h-8 text-blue-400 animate-spin" /></div>
      ) : classes.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="w-14 h-14 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No classes yet</h3>
          <p className="text-slate-500">Enter a join code above to enroll in your first class</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {classes.map(cls => (
            <Link key={cls.id} to={`/student/classes/${cls.id}`} className="block group">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-600 transition-all duration-200 hover:shadow-xl">
                <div className="h-20 relative" style={{ backgroundColor: (cls.banner_color || '#2563EB') + '33', borderBottom: `2px solid ${(cls.banner_color || '#2563EB')}44` }}>
                  <div className="absolute inset-0 flex items-end p-4">
                    <div>
                      <h3 className="text-white font-bold text-base leading-tight">{cls.name}</h3>
                      <p className="text-slate-300 text-sm">{cls.subject}</p>
                    </div>
                  </div>
                  <ChevronRight className="absolute top-4 right-4 w-5 h-5 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
                <div className="p-4">
                  <p className="text-sm text-slate-400 mb-3">By {cls.teacher_name}</p>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5"><Users className="w-4 h-4" />{cls.student_count} students</span>
                    <span className="flex items-center gap-1.5"><FlaskConical className="w-4 h-4" />{cls.lab_count} labs</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentClasses;

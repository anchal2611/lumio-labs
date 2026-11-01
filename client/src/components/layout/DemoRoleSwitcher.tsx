import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types/auth';
import { GraduationCap, BookOpen, ShieldAlert, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DemoRoleSwitcher: React.FC = () => {
  const { role, user, switchDemoRole } = useAuth();
  const navigate = useNavigate();

  const handleSwitch = (targetRole: UserRole) => {
    switchDemoRole(targetRole);
    if (targetRole === 'student') navigate('/student/dashboard');
    else if (targetRole === 'teacher') navigate('/teacher/dashboard');
    else if (targetRole === 'admin') navigate('/admin/dashboard');
  };

  return (
    <div className="fixed bottom-4 left-4 z-40 bg-navy-900/90 text-white backdrop-blur-md px-3.5 py-2 rounded-full border border-slate-700/60 shadow-floating flex items-center gap-2 text-xs">
      <div className="flex items-center gap-1.5 text-brand-aqua font-medium pr-1.5 border-r border-slate-700">
        <Sparkles className="w-3.5 h-3.5 text-brand-aqua" />
        <span className="hidden sm:inline">Demo Persona:</span>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => handleSwitch('student')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-medium transition-all ${
            role === 'student'
              ? 'bg-primary text-white shadow-xs'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title="Switch to Student Persona (Alex Chen)"
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Student</span>
        </button>
        <button
          onClick={() => handleSwitch('teacher')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-medium transition-all ${
            role === 'teacher'
              ? 'bg-teal-600 text-white shadow-xs'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title="Switch to Teacher Persona (Prof. Marcus Vance)"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Teacher</span>
        </button>
        <button
          onClick={() => handleSwitch('admin')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-medium transition-all ${
            role === 'admin'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
          title="Switch to Admin Persona (Dean Sarah Jenkins)"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Admin</span>
        </button>
      </div>
    </div>
  );
};

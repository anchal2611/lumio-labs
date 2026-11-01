import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { GraduationCap, BookOpen, ShieldAlert, Sparkles, Mail, Lock } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { UserRole } from '../../types/auth';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, switchDemoRole } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    const success = await login(email, password);
    setIsLoading(false);

    if (success) {
      toast.success('Welcome back', `Signed in as ${email}`);
      navigate('/student/dashboard');
    }
  };

  const handleDemoLogin = (role: UserRole) => {
    switchDemoRole(role);
    toast.success('Demo Mode Active', `Switched to Demo ${role.toUpperCase()} persona.`);
    if (role === 'student') navigate('/student/dashboard');
    else if (role === 'teacher') navigate('/teacher/dashboard');
    else if (role === 'admin') navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-brand-canvas flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <img src="/lumio-logo.svg" alt="LUMIO" className="w-10 h-10 rounded-xl shadow-xs" />
          <span className="text-2xl font-extrabold text-navy-900 tracking-tight">LUMIO</span>
        </Link>
        <h2 className="mt-4 text-xl font-bold text-navy-900">Sign in to your virtual lab</h2>
        <p className="mt-1 text-xs text-brand-muted">
          Access your practical experiments, real-time code editor, and assignments
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl shadow-floating border border-slate-200">
          {/* Quick Demo Personas */}
          <div className="mb-6 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-navy-900 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-brand-aqua" />
              <span>Instant 1-Click Demo Login</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('student')}
                className="flex flex-col items-center gap-1 p-2 bg-white hover:bg-blue-50 border border-slate-200 hover:border-primary rounded-lg text-[11px] font-semibold text-slate-700 transition-all"
              >
                <GraduationCap className="w-4 h-4 text-primary" />
                <span>Student</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('teacher')}
                className="flex flex-col items-center gap-1 p-2 bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-600 rounded-lg text-[11px] font-semibold text-slate-700 transition-all"
              >
                <BookOpen className="w-4 h-4 text-teal-600" />
                <span>Teacher</span>
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                className="flex flex-col items-center gap-1 p-2 bg-white hover:bg-amber-50 border border-slate-200 hover:border-amber-600 rounded-lg text-[11px] font-semibold text-slate-700 transition-all"
              >
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>Admin</span>
              </button>
            </div>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-slate-400">or sign in with university email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="University Email"
              type="email"
              placeholder="student@university.edu"
              leftIcon={<Mail className="w-4 h-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-navy-900">Password</label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                  Forgot?
                </Link>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-brand-muted">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="font-semibold text-primary hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

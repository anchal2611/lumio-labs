import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { LogIn, Eye, EyeOff, Loader2, FlaskConical, GraduationCap, BookOpen, Shield, Building2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { LoginFormData } from '../../types/auth';

const DEMO_CREDS = [
  { label: 'Student', email: 'student@demo.lumio.app', password: 'student123', icon: GraduationCap, color: 'from-violet-500/20 to-violet-600/10 border-violet-500/30 hover:border-violet-400/60' },
  { label: 'Teacher', email: 'teacher@demo.lumio.app', password: 'teacher123', icon: BookOpen, color: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 hover:border-cyan-400/60' },
  { label: 'Admin', email: 'admin@demo.lumio.app', password: 'admin123', icon: Shield, color: 'from-amber-500/20 to-amber-600/10 border-amber-500/30 hover:border-amber-400/60' },
];

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, setValue, formState: { isSubmitting } } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    try {
      await login(data);
      const user = JSON.parse(localStorage.getItem('lumio_auth_user') || '{}');
      const role = user?.role || 'student';
      navigate(role === 'admin' ? '/admin/dashboard' : role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard', { replace: true });
    } catch (e: any) {
      setError(e.message || 'Login failed. Please check your credentials.');
    }
  };

  const fillDemo = (cred: { email: string; password: string }) => {
    setValue('email', cred.email);
    setValue('password', cred.password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex items-center justify-center p-4">
      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="p-2 bg-blue-500/20 rounded-xl border border-blue-500/30">
              <FlaskConical className="w-7 h-7 text-blue-400" />
            </div>
            <span className="text-3xl font-black text-white tracking-tight">LUMIO</span>
          </div>
          <p className="text-slate-400 text-sm">Virtual Labs. Limitless Learning.</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          <h1 className="text-xl font-bold text-white mb-6">Sign in to your account</h1>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Email address</label>
              <input
                type="email"
                autoComplete="email"
                {...register('email', { required: true })}
                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  {...register('password', { required: true })}
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 pr-12 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/20"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link to="/forgot-password" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">Forgot password?</Link>
          </div>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-slate-700/50">
            <p className="text-xs text-slate-500 text-center mb-3">Try Demo Accounts — click to auto-fill</p>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_CREDS.map((cred) => {
                const Icon = cred.icon;
                return (
                  <button
                    key={cred.label}
                    type="button"
                    onClick={() => fillDemo(cred)}
                    className={`bg-gradient-to-b ${cred.color} border rounded-xl p-2.5 text-center transition-all duration-200 group`}
                  >
                    <Icon className="w-5 h-5 mx-auto mb-1 text-slate-300 group-hover:text-white transition-colors" />
                    <span className="text-xs text-slate-400 group-hover:text-white transition-colors font-medium">{cred.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer links */}
        <div className="mt-6 flex flex-col items-center gap-3 text-sm text-slate-500">
          <span>Don't have an account? <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium">Register</Link></span>
          <Link to="/institute/register" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors">
            <Building2 className="w-4 h-4" />
            Register Your Institute
          </Link>
        </div>
      </div>
    </div>
  );
};

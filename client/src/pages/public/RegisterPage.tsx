import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { UserPlus, Loader2, FlaskConical, CheckCircle2, Building2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiGet } from '../../services/api';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'student';
  branch?: string;
  semester?: number;
  department?: string;
  designation?: string;
}

export const RegisterPage: React.FC = () => {
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [domainCheck, setDomainCheck] = useState<{ matched: boolean; institute?: { name: string } } | null>(null);
  const [checkingDomain, setCheckingDomain] = useState(false);
  const { register, handleSubmit, watch, formState: { isSubmitting, errors } } = useForm<RegisterForm>({ defaultValues: { role: 'student' } });

  const watchEmail = watch('email');
  const watchRole = watch('role');
  const watchPassword = watch('password');

  // Debounced domain check
  useEffect(() => {
    if (!watchEmail || !watchEmail.includes('@')) {
      setDomainCheck(null);
      return;
    }
    setCheckingDomain(true);
    const timer = setTimeout(async () => {
      try {
        const result = await apiGet<any>(`/auth/check-domain?email=${encodeURIComponent(watchEmail)}`);
        setDomainCheck(result);
      } catch { setDomainCheck(null); }
      finally { setCheckingDomain(false); }
    }, 600);
    return () => clearTimeout(timer);
  }, [watchEmail, setValue]);

  const onSubmit = async (data: RegisterForm) => {
    setError(null);
    if (data.password !== data.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    try {
      await authRegister({
        name: data.name,
        email: data.email,
        password: data.password,
        role: 'student',
        branch: data.branch,
        semester: data.semester ? Number(data.semester) : undefined,
        department: data.department,
        designation: data.designation,
      });
      const user = JSON.parse(localStorage.getItem('lumio_auth_user') || '{}');
      const role = user?.role || 'student';
      navigate(role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard', { replace: true });
    } catch (e: any) {
      setError(e.message || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl" />
      </div>
      <div className="relative w-full max-w-lg">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="p-2 bg-blue-500/20 rounded-xl border border-blue-500/30"><FlaskConical className="w-6 h-6 text-blue-400" /></div>
            <span className="text-2xl font-black text-white tracking-tight">LUMIO</span>
          </div>
        </div>
        <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          <h1 className="text-xl font-bold text-white mb-6">Create your account</h1>
          {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Full Name</label>
              <input {...register('name', { required: true })} className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" placeholder="Your full name" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Email address</label>
              <div className="relative">
                <input type="email" {...register('email', { required: true })} className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 pr-10 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" placeholder="you@university.edu" />
                {checkingDomain && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 animate-spin" />}
              </div>
              {domainCheck?.matched && (
                <div className="mt-2 flex items-center gap-2 text-emerald-400 text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Joining <strong>{domainCheck.institute?.name}</strong></span>
                </div>
              )}
            </div>
            <p className="rounded-xl border border-slate-700/70 bg-slate-800/40 px-4 py-3 text-xs leading-relaxed text-slate-400">Student sign-up. Faculty and institute administrator accounts are created by an institute administrator.</p>
            {/* Student fields */}
            {(domainCheck?.matched || watchRole === 'student') && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Branch / Stream</label>
                  <input {...register('branch')} className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" placeholder="CSE" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Semester</label>
                  <select {...register('semester')} className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all">
                    <option value="">Select</option>
                    {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            )}
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Department</label>
              <input {...register('department')} className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" placeholder="Computer Science" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} {...register('password', { required: true, minLength: 6 })} className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 pr-12 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" placeholder="Min 6 characters" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Confirm Password</label>
              <input type="password" {...register('confirmPassword', { required: true })} className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" placeholder="Re-enter password" />
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20">
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500">Already have an account? <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">Sign in</Link></p>
        </div>
        <div className="mt-4 text-center">
          <Link to="/institute/register" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors">
            <Building2 className="w-4 h-4" /> Register Your Institute
          </Link>
        </div>
      </div>
    </div>
  );
};

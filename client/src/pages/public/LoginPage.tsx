import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Building2, Eye, EyeOff, GraduationCap, BookOpen, Shield, LogIn, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { LoginFormData } from '../../types/auth';
import { firebaseAuth } from '../../services/firebase';
import { PublicAuthLayout } from '../../components/layout/PublicAuthLayout';

const DEMO_CREDS = [
  { label: 'Student', email: 'student@demo.lumio.app', password: 'student123', icon: GraduationCap },
  { label: 'Teacher', email: 'teacher@demo.lumio.app', password: 'teacher123', icon: BookOpen },
  { label: 'Admin', email: 'admin@demo.lumio.app', password: 'admin123', icon: Shield },
];

const fieldClass = 'mt-1.5 h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-navy-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/15';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, setValue, watch, formState: { isSubmitting, errors: formErrors } } = useForm<LoginFormData>();
  const email = watch('email', '');

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    try {
      await login(data);
      const user = JSON.parse(localStorage.getItem('lumio_auth_user') || '{}');
      const role = user?.role || 'student';
      const from = (location.state as any)?.from;
      const destination = typeof from?.pathname === 'string' && from.pathname.startsWith('/') && !from.pathname.startsWith('//')
        ? `${from.pathname}${from.search || ''}${from.hash || ''}`
        : null;
      navigate(destination || (role === 'admin' ? '/admin/dashboard' : role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'), { replace: true });
    } catch (e: any) {
      setError(e.message || 'Could not sign in. Check your email and password.');
    }
  };

  const fillDemo = (cred: { email: string; password: string }) => {
    setValue('email', cred.email);
    setValue('password', cred.password);
  };

  return (
    <PublicAuthLayout panelTitle="Welcome back to your lab." panelDescription="Pick up where your classes, practicals, and team work come together.">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">LUMIO account</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-navy-900">Sign in</h2>
        <p className="mt-1.5 text-sm text-brand-muted">Use the email linked to your student or faculty account.</p>
      </div>

      {error && <div role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm leading-5 text-red-700">
        <p>{error}</p>
        {error.includes('LUMIO profile is missing') && <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 font-semibold">
          <Link to="/register" state={{ ...((location.state as any) || {}), prefillEmail: email }} className="underline underline-offset-2">Recreate student profile</Link>
          <Link to="/institute/register" state={{ prefillEmail: email }} className="underline underline-offset-2">Recreate institute account</Link>
        </div>}
      </div>}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div>
          <label htmlFor="login-email" className="block text-sm font-medium text-navy-900">Email address</label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="you@university.edu"
            aria-label="Email address"
            {...register('email', { required: 'Enter your email address.' })}
            className={fieldClass}
            aria-invalid={Boolean(formErrors.email)}
          />
          <FieldError message={formErrors.email?.message} />
        </div>

        <div>
          <label htmlFor="login-password" className="block text-sm font-medium text-navy-900">Password</label>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
              {...register('password', { required: 'Enter your password.' })}
              className={`${fieldClass} pr-12`}
              aria-invalid={Boolean(formErrors.password)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center text-slate-500 transition hover:text-navy-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            >
              {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
            </button>
          </div>
          <FieldError message={formErrors.password?.message} />
        </div>

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm font-medium text-primary hover:text-primary-dark">Forgot password?</Link>
        </div>

        <button type="submit" disabled={isSubmitting} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60">
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <LogIn className="h-4 w-4" aria-hidden="true" />}
          {isSubmitting ? 'Signing in…' : 'Sign in to LUMIO'}
        </button>
      </form>

      {!firebaseAuth && <div className="mt-6 border-t border-slate-200 pt-5">
        <p className="text-center text-xs font-medium text-brand-muted">Fill a demo account</p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {DEMO_CREDS.map((cred) => {
            const Icon = cred.icon;
            return (
              <button key={cred.label} type="button" onClick={() => fillDemo(cred)} className="flex min-h-16 flex-col items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2 py-2 text-xs font-medium text-navy-800 transition hover:border-blue-200 hover:bg-blue-50 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/30">
                <Icon className="h-4 w-4" aria-hidden="true" />{cred.label}
              </button>
            );
          })}
        </div>
      </div>}

      <div className="mt-6 space-y-3 border-t border-slate-200 pt-5 text-center text-sm text-brand-muted">
        <p>New to LUMIO? <Link to="/register" state={location.state} className="font-semibold text-primary hover:text-primary-dark">Create a student account</Link></p>
        <Link to="/institute/register" className="inline-flex items-center justify-center gap-1.5 font-medium text-brand-muted transition hover:text-primary">
          <Building2 className="h-4 w-4" aria-hidden="true" /> Register an institution
        </Link>
      </div>
    </PublicAuthLayout>
  );
};

function FieldError({ message }: { message?: string }) {
  return message ? <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">{message}</p> : null;
}

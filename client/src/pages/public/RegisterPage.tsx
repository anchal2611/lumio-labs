import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Building2, CheckCircle2, Eye, EyeOff, Loader2, UserPlus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiGet } from '../../services/api';
import { PublicAuthLayout } from '../../components/layout/PublicAuthLayout';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  branch?: string;
  semester?: number;
  department?: string;
}

const fieldClass = 'mt-1.5 h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-navy-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/15';

export const RegisterPage: React.FC = () => {
  const { register: authRegister } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [domainCheck, setDomainCheck] = useState<{ matched: boolean; institute?: { name: string } } | null>(null);
  const [checkingDomain, setCheckingDomain] = useState(false);
  const { register, handleSubmit, watch, formState: { isSubmitting, errors: formErrors } } = useForm<RegisterForm>();

  const watchEmail = watch('email');
  const watchPassword = watch('password');

  useEffect(() => {
    if (!watchEmail || !watchEmail.includes('@')) {
      setDomainCheck(null);
      setCheckingDomain(false);
      return;
    }
    let active = true;
    setCheckingDomain(true);
    const timer = setTimeout(async () => {
      try {
        const result = await apiGet<any>(`/auth/check-domain?email=${encodeURIComponent(watchEmail)}`);
        if (active) setDomainCheck(result);
      } catch {
        if (active) setDomainCheck(null);
      } finally {
        if (active) setCheckingDomain(false);
      }
    }, 500);
    return () => { active = false; clearTimeout(timer); };
  }, [watchEmail]);

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
      });
      const user = JSON.parse(localStorage.getItem('lumio_auth_user') || '{}');
      const role = user?.role || 'student';
      const from = (location.state as any)?.from;
      const destination = typeof from?.pathname === 'string' && from.pathname.startsWith('/') && !from.pathname.startsWith('//')
        ? `${from.pathname}${from.search || ''}${from.hash || ''}`
        : null;
      navigate(destination || (role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard'), { replace: true });
    } catch (e: any) {
      setError(e.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <PublicAuthLayout panelTitle="Start learning by doing." panelDescription="Join your campus labs, work through practicals, and keep your progress connected to class.">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Student access</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-navy-900">Create your account</h2>
        <p className="mt-1.5 text-sm leading-5 text-brand-muted">Use your university email to connect with your institute.</p>
      </div>

      {error && <div role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm leading-5 text-red-700">{error}</div>}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div>
          <label htmlFor="register-name" className="block text-sm font-medium text-navy-900">Full name</label>
          <input id="register-name" autoComplete="name" placeholder="Your full name" {...register('name', { required: 'Enter your name.' })} className={fieldClass} aria-invalid={Boolean(formErrors.name)} />
          <FieldError message={formErrors.name?.message} />
        </div>

        <div>
          <label htmlFor="register-email" className="block text-sm font-medium text-navy-900">University email</label>
          <div className="relative">
            <input id="register-email" type="email" autoComplete="email" placeholder="you@university.edu" {...register('email', { required: 'Enter your email.' })} className={`${fieldClass} pr-10`} aria-invalid={Boolean(formErrors.email)} />
            {checkingDomain && <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" aria-label="Checking institute" />}
          </div>
          <FieldError message={formErrors.email?.message} />
          {domainCheck?.matched && (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-emerald-700">
              <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
              Joining <strong>{domainCheck.institute?.name}</strong>
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="register-branch" className="block text-sm font-medium text-navy-900">Program / branch <span className="font-normal text-slate-400">(optional)</span></label>
            <input id="register-branch" autoComplete="organization-title" placeholder="Computer Science" {...register('branch')} className={fieldClass} />
          </div>
          <div>
            <label htmlFor="register-semester" className="block text-sm font-medium text-navy-900">Semester <span className="font-normal text-slate-400">(optional)</span></label>
            <select id="register-semester" {...register('semester')} className={`${fieldClass} appearance-none`}>
              <option value="">Choose semester</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((semester) => <option key={semester} value={semester}>{semester}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="register-department" className="block text-sm font-medium text-navy-900">Department <span className="font-normal text-slate-400">(optional)</span></label>
          <input id="register-department" autoComplete="organization" placeholder="Computer Science" {...register('department')} className={fieldClass} />
        </div>

        <div>
          <label htmlFor="register-password" className="block text-sm font-medium text-navy-900">Password</label>
          <div className="relative">
            <input id="register-password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" placeholder="At least 6 characters" {...register('password', { required: 'Create a password.', minLength: { value: 6, message: 'Use at least 6 characters.' } })} className={`${fieldClass} pr-12`} aria-invalid={Boolean(formErrors.password)} />
            <button type="button" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center text-slate-500 transition hover:text-navy-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
              {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
            </button>
          </div>
          <FieldError message={formErrors.password?.message} />
        </div>

        <div>
          <label htmlFor="register-confirm-password" className="block text-sm font-medium text-navy-900">Confirm password</label>
          <input id="register-confirm-password" type="password" autoComplete="new-password" placeholder="Enter the password again" {...register('confirmPassword', { required: 'Confirm your password.', validate: (value) => value === watchPassword || 'Passwords do not match.' })} className={fieldClass} aria-invalid={Boolean(formErrors.confirmPassword)} />
          <FieldError message={formErrors.confirmPassword?.message} />
        </div>

        <p className="rounded-lg border border-blue-100 bg-blue-50 px-3.5 py-3 text-xs leading-5 text-blue-900">
          Faculty and institute administrator accounts are managed by an institute administrator.
        </p>

        <button type="submit" disabled={isSubmitting} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60">
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <UserPlus className="h-4 w-4" aria-hidden="true" />}
          {isSubmitting ? 'Creating account…' : 'Create student account'}
        </button>
      </form>

      <div className="mt-6 space-y-3 border-t border-slate-200 pt-5 text-center text-sm text-brand-muted">
        <p>Already registered? <Link to="/login" state={location.state} className="font-semibold text-primary hover:text-primary-dark">Sign in</Link></p>
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

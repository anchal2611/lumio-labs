import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Building2, CheckCircle2, Globe, Loader2, Plus, User, X } from 'lucide-react';
import { apiPost } from '../../services/api';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { firebaseAuth, saveFirebaseUserProfile } from '../../services/firebase';
import { PublicAuthLayout } from '../../components/layout/PublicAuthLayout';

const STEPS = ['Institute', 'Admin account', 'Email domains'];
const fieldClass = 'mt-1.5 h-11 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-sm text-navy-900 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/15';

export const InstituteRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [domainInput, setDomainInput] = useState('');
  const [result, setResult] = useState<any>(null);
  const [form, setForm] = useState(() => ({
    instituteName: '', type: 'university', city: '', website: '',
    adminName: '', adminEmail: (location.state as any)?.prefillEmail || '', adminPassword: '', confirmPassword: '',
    emailDomains: [] as string[],
  }));

  const update = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const addDomain = () => {
    const domain = domainInput.trim().toLowerCase().replace(/^@/, '');
    if (domain && !form.emailDomains.includes(domain)) {
      setForm((current) => ({ ...current, emailDomains: [...current.emailDomains, domain] }));
      setDomainInput('');
    }
  };

  const removeDomain = (domain: string) => setForm((current) => ({ ...current, emailDomains: current.emailDomains.filter((item) => item !== domain) }));

  const nextStep = () => {
    setError(null);
    if (step === 0 && !form.instituteName.trim()) { setError('Enter your institute name.'); return; }
    if (step === 1) {
      if (!form.adminName.trim() || !form.adminEmail.trim() || !form.adminPassword) { setError('Complete all admin account fields.'); return; }
      if (form.adminPassword !== form.confirmPassword) { setError('Passwords do not match.'); return; }
      if (form.adminPassword.length < 6) { setError('Use a password with at least 6 characters.'); return; }
    }
    setStep((current) => current + 1);
  };

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      let firebaseUser = firebaseAuth?.currentUser || null;
      if (firebaseAuth && !firebaseUser) {
        try {
          firebaseUser = (await createUserWithEmailAndPassword(firebaseAuth, form.adminEmail, form.adminPassword)).user;
        } catch (authError: any) {
          if (authError?.code !== 'auth/email-already-in-use') throw authError;
          firebaseUser = (await signInWithEmailAndPassword(firebaseAuth, form.adminEmail, form.adminPassword)).user;
        }
      }
      const response = await apiPost<any>('/institutes/register', {
        instituteName: form.instituteName.trim(),
        type: form.type,
        city: form.city.trim(),
        website: form.website.trim(),
        adminName: form.adminName.trim(),
        adminEmail: form.adminEmail.trim(),
        ...(firebaseUser ? {} : { adminPassword: form.adminPassword }),
        emailDomains: form.emailDomains,
      });
      if (firebaseUser) {
        await saveFirebaseUserProfile({ uid: firebaseUser.uid, name: form.adminName.trim(), email: form.adminEmail.trim() }).catch(() => {});
      }
      setResult(response);
      setStep(3);
    } catch (err: any) {
      setError(err.message || 'Institute registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicAuthLayout panelTitle="Bring your institute's lab work together." panelDescription="Set up your campus workspace, connect student email domains, and give faculty a place to publish practicals.">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Institute onboarding</p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-navy-900">Register your institute</h2>
        <p className="mt-1.5 text-sm leading-5 text-brand-muted">Create the institute and its first administrator account.</p>
      </div>

      {step < 3 && (
        <ol aria-label="Registration progress" className="mt-6 grid grid-cols-3 gap-2">
          {STEPS.map((label, index) => (
            <li key={label} aria-current={index === step ? 'step' : undefined} className="min-w-0">
              <div className={`flex items-center gap-2 border-t-2 pt-2.5 ${index <= step ? 'border-primary text-primary' : 'border-slate-200 text-slate-400'}`}>
                <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${index < step ? 'bg-primary text-white' : index === step ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-500'}`}>
                  {index < step ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> : index + 1}
                </span>
                <span className="truncate text-[11px] font-semibold sm:text-xs">{label}</span>
              </div>
            </li>
          ))}
        </ol>
      )}

      {error && <div role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm leading-5 text-red-700">{error}</div>}

      {step === 0 && (
        <div className="mt-6 space-y-4">
          <h3 className="flex items-center gap-2 text-base font-semibold text-navy-900"><Building2 className="h-4 w-4 text-primary" aria-hidden="true" /> Institute details</h3>
          <div>
            <label htmlFor="institute-name" className="block text-sm font-medium text-navy-900">Institute name</label>
            <input id="institute-name" value={form.instituteName} onChange={(event) => update('instituteName', event.target.value)} className={fieldClass} placeholder="North Valley University" autoComplete="organization" />
          </div>
          <div>
            <label htmlFor="institute-type" className="block text-sm font-medium text-navy-900">Institute type</label>
            <select id="institute-type" value={form.type} onChange={(event) => update('type', event.target.value)} className={`${fieldClass} appearance-none`}>
              {['university', 'college', 'school', 'research_institute'].map((type) => <option key={type} value={type}>{type.replace('_', ' ').replace(/\b\w/g, (character) => character.toUpperCase())}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="institute-city" className="block text-sm font-medium text-navy-900">City <span className="font-normal text-slate-400">(optional)</span></label>
              <input id="institute-city" value={form.city} onChange={(event) => update('city', event.target.value)} className={fieldClass} placeholder="City" autoComplete="address-level2" />
            </div>
            <div>
              <label htmlFor="institute-website" className="block text-sm font-medium text-navy-900">Website <span className="font-normal text-slate-400">(optional)</span></label>
              <input id="institute-website" type="url" value={form.website} onChange={(event) => update('website', event.target.value)} className={fieldClass} placeholder="https://example.edu" autoComplete="url" />
            </div>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="mt-6 space-y-4">
          <h3 className="flex items-center gap-2 text-base font-semibold text-navy-900"><User className="h-4 w-4 text-primary" aria-hidden="true" /> Admin account</h3>
          <div>
            <label htmlFor="admin-name" className="block text-sm font-medium text-navy-900">Administrator name</label>
            <input id="admin-name" value={form.adminName} onChange={(event) => update('adminName', event.target.value)} className={fieldClass} placeholder="Your full name" autoComplete="name" />
          </div>
          <div>
            <label htmlFor="admin-email" className="block text-sm font-medium text-navy-900">Administrator email</label>
            <input id="admin-email" type="email" value={form.adminEmail} onChange={(event) => update('adminEmail', event.target.value)} className={fieldClass} placeholder="admin@example.edu" autoComplete="email" />
          </div>
          <div>
            <label htmlFor="admin-password" className="block text-sm font-medium text-navy-900">Password</label>
            <input id="admin-password" type="password" value={form.adminPassword} onChange={(event) => update('adminPassword', event.target.value)} className={fieldClass} placeholder="At least 6 characters" autoComplete="new-password" />
          </div>
          <div>
            <label htmlFor="admin-confirm-password" className="block text-sm font-medium text-navy-900">Confirm password</label>
            <input id="admin-confirm-password" type="password" value={form.confirmPassword} onChange={(event) => update('confirmPassword', event.target.value)} className={fieldClass} placeholder="Enter the password again" autoComplete="new-password" />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="mt-6 space-y-4">
          <h3 className="flex items-center gap-2 text-base font-semibold text-navy-900"><Globe className="h-4 w-4 text-primary" aria-hidden="true" /> Student email domains</h3>
          <p className="text-sm leading-5 text-brand-muted">Students using these domains will be linked to your institute and can see its starter labs. You can also add domains later in Institute settings.</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={domainInput}
              onChange={(event) => setDomainInput(event.target.value)}
              onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addDomain(); } }}
              className={`${fieldClass} mt-0 min-w-0 flex-1`}
              placeholder="example.edu"
              aria-label="Student email domain"
            />
            <button type="button" onClick={addDomain} className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-navy-900 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/30">
              <Plus className="h-4 w-4" aria-hidden="true" /> Add domain
            </button>
          </div>
          {form.emailDomains.length ? (
            <ul className="flex flex-wrap gap-2" aria-label="Added email domains">
              {form.emailDomains.map((domain) => (
                <li key={domain} className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-sm text-blue-800">
                  @{domain}
                  <button type="button" onClick={() => removeDomain(domain)} aria-label={`Remove ${domain}`} className="inline-flex h-5 w-5 items-center justify-center rounded-full text-blue-700 transition hover:bg-blue-100 hover:text-red-700">
                    <X className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3 text-xs leading-5 text-brand-muted">No domains added. Students can still be connected through class enrollment.</p>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="py-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
          </div>
          <h3 className="mt-4 text-xl font-bold tracking-tight text-navy-900">Institute registered</h3>
          <p className="mt-2 text-sm leading-6 text-brand-muted"><strong className="text-navy-900">{result?.institute?.name}</strong> is ready in LUMIO.</p>
          <p className="mt-1 text-sm leading-6 text-brand-muted">Starter labs have been added. Sign in with the administrator account to continue.</p>
          <button type="button" onClick={() => navigate('/login')} className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2">
            Go to sign in <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {step < 3 && (
        <div className="mt-7 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          {step > 0 ? (
            <button type="button" onClick={() => { setError(null); setStep((current) => current - 1); }} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-navy-900 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/30">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back
            </button>
          ) : <span />}
          {step < 2 ? (
            <button type="button" onClick={nextStep} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 sm:min-w-32">
              Continue <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={loading} className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-white transition hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-48">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <CheckCircle2 className="h-4 w-4" aria-hidden="true" />}
              {loading ? 'Registering…' : 'Register institute'}
            </button>
          )}
        </div>
      )}

      <p className="mt-6 border-t border-slate-200 pt-5 text-center text-sm text-brand-muted">Already have an account? <Link to="/login" className="font-semibold text-primary hover:text-primary-dark">Sign in</Link></p>
    </PublicAuthLayout>
  );
};

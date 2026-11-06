import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, User, Globe, CheckCircle2, Plus, X, Loader2, FlaskConical, ArrowLeft, ArrowRight } from 'lucide-react';
import { apiPost } from '../../services/api';

const STEPS = ['Institute Details', 'Admin Account', 'Email Domains', 'Complete'];

export const InstituteRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [domainInput, setDomainInput] = useState('');
  const [result, setResult] = useState<any>(null);
  const [form, setForm] = useState({
    instituteName: '', type: 'university', city: '', website: '',
    adminName: '', adminEmail: '', adminPassword: '', confirmPassword: '',
    emailDomains: [] as string[],
  });

  const update = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const addDomain = () => {
    const d = domainInput.trim().toLowerCase().replace(/^@/, '');
    if (d && !form.emailDomains.includes(d)) {
      setForm(f => ({ ...f, emailDomains: [...f.emailDomains, d] }));
      setDomainInput('');
    }
  };

  const removeDomain = (d: string) => setForm(f => ({ ...f, emailDomains: f.emailDomains.filter(x => x !== d) }));

  const nextStep = () => {
    setError(null);
    if (step === 0 && !form.instituteName) { setError('Institute name is required.'); return; }
    if (step === 1) {
      if (!form.adminName || !form.adminEmail || !form.adminPassword) { setError('All admin fields are required.'); return; }
      if (form.adminPassword !== form.confirmPassword) { setError('Passwords do not match.'); return; }
      if (form.adminPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
    }
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await apiPost<any>('/institutes/register', {
        instituteName: form.instituteName,
        type: form.type,
        city: form.city,
        website: form.website,
        adminName: form.adminName,
        adminEmail: form.adminEmail,
        adminPassword: form.adminPassword,
        emailDomains: form.emailDomains,
      });
      setResult(res);
      setStep(3);
    } catch (e: any) {
      setError(e.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl" />
      </div>
      <div className="relative w-full max-w-xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="p-2 bg-blue-500/20 rounded-xl border border-blue-500/30"><FlaskConical className="w-6 h-6 text-blue-400" /></div>
            <span className="text-2xl font-black text-white">LUMIO</span>
          </div>
          <h2 className="text-slate-400 text-sm">Register Your Institute</h2>
        </div>

        {/* Stepper */}
        {step < 3 && (
          <div className="flex items-center justify-center gap-2 mb-6">
            {STEPS.slice(0, 3).map((s, i) => (
              <React.Fragment key={i}>
                <div className={`flex items-center gap-1.5 ${ i < step ? 'text-emerald-400' : i === step ? 'text-blue-400' : 'text-slate-600' }`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${ i < step ? 'bg-emerald-500/20 border-emerald-500/50' : i === step ? 'bg-blue-500/20 border-blue-500/50' : 'bg-slate-800 border-slate-700' }`}>
                    {i < step ? '✓' : i + 1}
                  </div>
                  <span className="text-xs hidden sm:block">{s}</span>
                </div>
                {i < 2 && <div className={`flex-1 h-px max-w-8 ${ i < step ? 'bg-emerald-500/50' : 'bg-slate-700' }`} />}
              </React.Fragment>
            ))}
          </div>
        )}

        <div className="bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          {error && <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>}

          {step === 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2"><Building2 className="w-5 h-5 text-blue-400" /> Institute Details</h3>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Institute Name *</label>
                <input value={form.instituteName} onChange={e => update('instituteName', e.target.value)} className={inputCls} placeholder="Indian Institute of Technology Delhi" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Type</label>
                <select value={form.type} onChange={e => update('type', e.target.value)} className={inputCls}>
                  {['university', 'college', 'school', 'research_institute'].map(t => <option key={t} value={t}>{t.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">City</label>
                  <input value={form.city} onChange={e => update('city', e.target.value)} className={inputCls} placeholder="New Delhi" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">Website</label>
                  <input value={form.website} onChange={e => update('website', e.target.value)} className={inputCls} placeholder="https://iit.ac.in" />
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2"><User className="w-5 h-5 text-blue-400" /> Admin Account</h3>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Admin Name *</label>
                <input value={form.adminName} onChange={e => update('adminName', e.target.value)} className={inputCls} placeholder="Dr. Rajan Kumar" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Admin Email *</label>
                <input type="email" value={form.adminEmail} onChange={e => update('adminEmail', e.target.value)} className={inputCls} placeholder="admin@iit.ac.in" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Password *</label>
                <input type="password" value={form.adminPassword} onChange={e => update('adminPassword', e.target.value)} className={inputCls} placeholder="Min 6 characters" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Confirm Password *</label>
                <input type="password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} className={inputCls} placeholder="Re-enter password" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2"><Globe className="w-5 h-5 text-blue-400" /> Email Domains</h3>
              <p className="text-sm text-slate-400">Students who register with your institute email domain will be automatically enrolled. Add all your institute's email domains.</p>
              <div className="flex gap-2">
                <input
                  value={domainInput}
                  onChange={e => setDomainInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addDomain())}
                  className={`${inputCls} flex-1`}
                  placeholder="iit.ac.in"
                />
                <button onClick={addDomain} className="px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-colors">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              {form.emailDomains.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {form.emailDomains.map(d => (
                    <span key={d} className="inline-flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-300 rounded-lg px-3 py-1.5 text-sm">
                      @{d}
                      <button onClick={() => removeDomain(d)} className="text-blue-400 hover:text-red-400 transition-colors"><X className="w-3.5 h-3.5" /></button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-600 italic">No domains added yet. You can skip this and add them from Admin Settings later.</p>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-9 h-9 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Institute Registered!</h3>
              <p className="text-slate-400 text-sm mb-1"><strong className="text-white">{result?.institute?.name}</strong> is now on LUMIO.</p>
              <p className="text-slate-500 text-sm mb-6">Log in with your admin account to get started.</p>
              <button onClick={() => navigate('/login')} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all">Go to Login</button>
            </div>
          )}

          {step < 3 && (
            <div className="flex gap-3 mt-6">
              {step > 0 && (
                <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all">
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
              )}
              {step < 2 ? (
                <button onClick={nextStep} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-all">
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={handleSubmit} disabled={loading} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-semibold py-3 rounded-xl transition-all">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                  {loading ? 'Registering...' : 'Register Institute'}
                </button>
              )}
            </div>
          )}
        </div>
        <div className="mt-4 text-center">
          <Link to="/login" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

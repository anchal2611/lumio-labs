import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { firebaseAuth } from '../../services/firebase';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (!firebaseAuth) throw new Error('Password reset is unavailable until Firebase Authentication is configured.');
      await sendPasswordResetEmail(firebaseAuth, email.trim());
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.code === 'auth/user-not-found'
        ? 'If an account exists for that email, a reset link will be sent.'
        : err?.code === 'auth/invalid-email' ? 'Enter a valid email address.' : (err?.message || 'Could not send a reset email.'));
      if (err?.code === 'auth/user-not-found') setSubmitted(true);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-brand-canvas flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <img src="/lumio-logo.svg" alt="LUMIO" className="w-10 h-10 rounded-xl shadow-xs" />
          <span className="text-2xl font-extrabold text-navy-900 tracking-tight">LUMIO</span>
        </Link>
        <h2 className="mt-4 text-xl font-bold text-navy-900">Reset your lab credentials</h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl shadow-floating border border-slate-200">
          {submitted ? (
            <div className="text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-navy-900">Password Reset Email Dispatched</h3>
              <p className="text-xs text-brand-muted leading-relaxed">
                If an account exists for <strong className="text-navy-900">{email}</strong>, Firebase has sent a secure password reset link. Check your inbox and spam folder.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold mt-4 hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
              <p className="text-xs text-brand-muted leading-relaxed">
                Enter your registered university email address to receive password reset instructions.
              </p>
              <Input
                label="University Email"
                type="email"
                placeholder="name@university.edu"
                leftIcon={<Mail className="w-4 h-4" />}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" variant="primary" size="md" className="w-full" disabled={loading}>
                {loading ? 'Sending…' : 'Send Reset Link'}
              </Button>
              <div className="text-center pt-2">
                <Link to="/login" className="text-xs text-primary font-semibold hover:underline">
                  Return to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

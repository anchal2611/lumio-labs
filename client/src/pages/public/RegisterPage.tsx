import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { UserRole } from '../../types/auth';
import { useToast } from '../../contexts/ToastContext';
import { GraduationCap, BookOpen } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [role, setRole] = useState<UserRole>('student');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [university, setUniversity] = useState('Apex Institute of Technology');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [branch, setBranch] = useState('Software Engineering');
  const [semester, setSemester] = useState(4);
  const [designation, setDesignation] = useState('Assistant Professor');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) return;

    setIsLoading(true);
    const ok = await register({
      fullName,
      email,
      password,
      role,
      university,
      department,
      branch,
      semester: role === 'student' ? semester : undefined,
      designation: role === 'teacher' ? designation : undefined,
    });
    setIsLoading(false);

    if (ok) {
      toast.success('Registration Successful', `Welcome to LUMIO, ${fullName}!`);
      navigate(role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-brand-canvas flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-xl text-center">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <img src="/lumio-logo.svg" alt="LUMIO" className="w-10 h-10 rounded-xl shadow-xs" />
          <span className="text-2xl font-extrabold text-navy-900 tracking-tight">LUMIO</span>
        </Link>
        <h2 className="mt-3 text-xl font-bold text-navy-900">Create your university account</h2>
        <p className="mt-1 text-xs text-brand-muted">
          Join your department&apos;s digital virtual laboratory workspace
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl shadow-floating border border-slate-200">
          {/* Role Selector Tabs */}
          <div className="grid grid-cols-2 gap-3 mb-6 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                role === 'student' ? 'bg-white text-primary shadow-xs' : 'text-slate-600 hover:text-navy-900'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Student Account</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('teacher')}
              className={`flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${
                role === 'teacher' ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-600 hover:text-navy-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Faculty Account</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="e.g. Alex Chen"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />

            <Input
              label="University Email"
              type="email"
              placeholder="name@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="University / Institution"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                required
              />

              <Input
                label="Department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
              />
            </div>

            {role === 'student' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label="Branch / Major"
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  required
                />
                <div>
                  <label className="block text-xs font-semibold text-navy-900 mb-1.5">Semester</label>
                  <select
                    value={semester}
                    onChange={(e) => setSemester(Number(e.target.value))}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-brand-text focus:outline-none focus:border-primary"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        Semester {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <Input
                label="Faculty Designation"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="e.g. Associate Professor / Lab Director"
                required
              />
            )}

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-4"
              isLoading={isLoading}
            >
              Complete Registration
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-brand-muted">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

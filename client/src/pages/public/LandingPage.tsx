import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FlaskConical,
  Code2,
  Database,
  Cpu,
  Users,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Layers,
  GraduationCap,
  BookOpen,
  Terminal,
  Zap,
  Globe,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent } from '../../components/ui/Card';
import { MOCK_LABS } from '../../services/mockData';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types/auth';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { switchDemoRole } = useAuth();

  const handleLaunchDemo = (role: UserRole) => {
    switchDemoRole(role);
    if (role === 'student') navigate('/student/dashboard');
    else if (role === 'teacher') navigate('/teacher/dashboard');
    else if (role === 'admin') navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-brand-canvas text-brand-text flex flex-col selection:bg-brand-lightAqua selection:text-navy-900">
      {/* Navigation Bar */}
      <header className="h-18 bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/lumio-logo.svg" alt="LUMIO" className="w-9 h-9 rounded-xl shadow-xs" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl text-navy-900 tracking-tight">LUMIO</span>
              <Badge variant="aqua" size="sm">
                Virtual Labs
              </Badge>
            </div>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-brand-muted">
          <a href="#labs" className="hover:text-primary transition-colors">
            Explore Labs
          </a>
          <a href="#collaboration" className="hover:text-primary transition-colors">
            Collaboration
          </a>
          <a href="#ecosystem" className="hover:text-primary transition-colors">
            Ecosystem
          </a>
          <a href="#how-it-works" className="hover:text-primary transition-colors">
            How It Works
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2 text-xs font-semibold text-navy-900 hover:text-primary transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 text-xs font-semibold bg-primary hover:bg-primary-dark text-white rounded-lg shadow-sm transition-all hover:shadow-primary/20"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-4 sm:px-8 overflow-hidden bg-gradient-to-b from-white via-brand-canvas to-brand-canvas">
        {/* Subtle decorative circles */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-brand-lightAqua/40 via-sky-100/30 to-blue-100/20 blur-3xl rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-primary text-xs font-semibold mb-6 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Virtual Labs. Limitless Learning.</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-navy-900 tracking-tight leading-[1.12]">
            Your University Lab. <br />
            <span className="bg-gradient-to-r from-primary via-sky-600 to-teal-600 bg-clip-text text-transparent">
              Reimagined.
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-brand-muted max-w-2xl mx-auto leading-relaxed font-normal">
            Learn by doing. Build by experimenting. Collaborate without boundaries. Experience your university laboratories in one connected digital workspace.
          </p>

          {/* Call to action buttons */}
          <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
            <a
              href="#labs"
              className="px-6 py-3 text-sm font-semibold bg-primary hover:bg-primary-dark text-white rounded-xl shadow-md transition-all hover:scale-[1.02] flex items-center gap-2"
            >
              <FlaskConical className="w-4 h-4" />
              <span>Explore Laboratories</span>
            </a>
            <Link
              to="/register"
              className="px-6 py-3 text-sm font-semibold bg-white hover:bg-slate-50 text-navy-900 border border-slate-300 rounded-xl shadow-xs transition-all hover:scale-[1.02] flex items-center gap-2"
            >
              <span>Student & Faculty Access</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Quick Demo Launchers */}
          <div className="mt-10 p-4 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-elevated max-w-xl mx-auto">
            <p className="text-xs font-semibold text-navy-900 uppercase tracking-wider mb-2.5">
              Instant University Tour (1-Click Demo)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleLaunchDemo('student')}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-primary text-xs font-semibold border border-blue-200 transition-all"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Demo Student</span>
              </button>
              <button
                onClick={() => handleLaunchDemo('teacher')}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-semibold border border-teal-200 transition-all"
              >
                <BookOpen className="w-4 h-4" />
                <span>Demo Teacher</span>
              </button>
              <button
                onClick={() => handleLaunchDemo('admin')}
                className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-semibold border border-amber-200 transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Demo Admin</span>
              </button>
            </div>
          </div>
        </div>

        {/* Hero Interactive Terminal / IDE Mockup */}
        <div className="max-w-5xl mx-auto mt-14 rounded-2xl border border-slate-700/80 shadow-2xl bg-navy-950 overflow-hidden text-left font-mono text-xs text-slate-300">
          <div className="flex items-center justify-between px-4 py-3 bg-navy-900 border-b border-navy-800">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 text-slate-400 font-sans text-xs">lumio-virtual-ide — binary_search.py</span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-brand-aqua font-sans">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Sandbox Engine Connected</span>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-navy-950">
            <div>
              <div className="text-slate-500 mb-2">// Guided Practical #1 — Algorithm Verification</div>
              <pre className="text-slate-200 leading-relaxed font-mono">
{`def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1

# Executed in sandboxed virtual container`}
              </pre>
            </div>

            <div className="border-t md:border-t-0 md:border-l border-navy-800 md:pl-6 pt-4 md:pt-0">
              <div className="text-emerald-400 font-semibold mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Compiler Stdout (Execution 24ms | 4.1MB RAM)</span>
              </div>
              <div className="p-3 bg-navy-900/90 rounded-lg border border-navy-800 text-[11px] text-emerald-300 space-y-1">
                <div>=== LUMIO VIRTUAL LAB: SEARCH ALGORITHMS ===</div>
                <div>Dataset: [12, 24, 35, 47, 59, 68, 77, 88, 99]</div>
                <div>Searching for target: 68</div>
                <div>[Result] Binary Search Found at Index: 5</div>
                <div className="text-brand-aqua">[Status] Verification Passed: O(log n) satisfied.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Laboratory Categories Section */}
      <section id="labs" className="py-20 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <Badge variant="aqua" size="sm" className="mb-2">
            Diverse Practical Disciplines
          </Badge>
          <h2 className="text-3xl font-extrabold text-navy-900 tracking-tight">
            Comprehensive Digital Laboratories
          </h2>
          <p className="text-sm text-brand-muted mt-2">
            Every laboratory supports both Guided Practicals with Viva questions and Open Workspace for free experimentation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_LABS.map((lab) => (
            <Card key={lab.id} hoverable className="border border-slate-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-primary font-bold">
                    {lab.languages[0]?.toUpperCase() || 'LAB'}
                  </div>
                  <Badge variant="primary" size="sm" className="capitalize">
                    {lab.category}
                  </Badge>
                </div>
                <h3 className="text-base font-bold text-navy-900">{lab.name}</h3>
                <p className="text-xs text-brand-muted mt-1 leading-relaxed">
                  {lab.description}
                </p>

                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 font-medium justify-between">
                  <span>{lab.experimentCount} Practicals</span>
                  <button
                    onClick={() => handleLaunchDemo('student')}
                    className="text-primary font-semibold flex items-center gap-1 hover:underline"
                  >
                    Open Lab <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Collaboration Triad Section */}
      <section id="collaboration" className="py-20 px-4 sm:px-8 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <Badge variant="primary" size="sm" className="mb-2">
              Three-Way Digital Collaboration
            </Badge>
            <h2 className="text-3xl font-extrabold text-navy-900 tracking-tight">
              A Connected University Community
            </h2>
            <p className="text-sm text-brand-muted mt-2">
              Collaboration is not an afterthought in LUMIO. It powers code co-editing, faculty practical authoring, and student doubt resolution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-primary flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-navy-900">Student-to-Student</h3>
              <p className="text-xs text-brand-muted leading-relaxed">
                Real-time pair programming rooms, multi-cursor code editors, study groups, peer review feedback, and live group chat.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-navy-900">Teacher-to-Teacher</h3>
              <p className="text-xs text-brand-muted leading-relaxed">
                Collaborative authoring of lab manuals, shared assignment templates, department resource pools, and faculty discussion rooms.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-navy-900">Student-to-Teacher</h3>
              <p className="text-xs text-brand-muted leading-relaxed">
                &quot;Ask a Teacher&quot; doubt forums, code line annotations, assignment submission feedback, and doubt resolution history.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* University Footer */}
      <footer className="mt-auto bg-navy-950 text-slate-400 py-12 px-4 sm:px-8 text-xs border-t border-navy-900">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/lumio-logo.svg" alt="LUMIO" className="w-7 h-7 rounded-lg" />
            <div>
              <span className="text-white font-bold text-sm tracking-tight">LUMIO</span>
              <p className="text-[11px] text-slate-500">Virtual Labs. Limitless Learning.</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/login" className="hover:text-white transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="hover:text-white transition-colors">
              Register Institution
            </Link>
            <a href="#labs" className="hover:text-white transition-colors">
              Laboratories
            </a>
          </div>

          <p className="text-slate-500 text-[11px]">
            &copy; 2026 LUMIO Platform. Built for University Computer Science & Engineering.
          </p>
        </div>
      </footer>
    </div>
  );
};

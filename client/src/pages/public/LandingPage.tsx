import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpenCheck,
  BookOpen,
  Building2,
  Check,
  Code2,
  Cpu,
  Database,
  FlaskConical,
  GraduationCap,
  Layers3,
  UsersRound,
  type LucideIcon,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent } from '../../components/ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import { config } from '../../config/env';
import { UserRole } from '../../types/auth';

const dashboardPaths: Record<UserRole, string> = {
  student: '/student/dashboard',
  teacher: '/teacher/dashboard',
  admin: '/admin/dashboard',
};

const labBrowsePaths: Record<UserRole, string> = {
  student: '/student/labs',
  teacher: '/teacher/labs',
  admin: '/admin/labs',
};

const primaryLinkClass = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2';
const secondaryLinkClass = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-navy-900 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2';

export const LandingPage: React.FC = () => {
  const { isAuthenticated, role } = useAuth();
  const browsePath = isAuthenticated ? labBrowsePaths[role] : '/student/labs';

  return (
    <div className="min-h-screen bg-brand-canvas text-brand-text selection:bg-brand-lightAqua selection:text-navy-900">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:shadow-floating">
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex shrink-0 items-center gap-2.5" aria-label={`${config.appName} home`}>
            <img src="/lumio-logo.svg" alt="" className="h-9 w-9 rounded-xl" />
            <span className="text-lg font-extrabold tracking-tight text-navy-900">{config.appName}</span>
          </Link>

          <nav aria-label="Main navigation" className="hidden items-center gap-6 text-sm font-medium text-brand-muted lg:flex">
            <a href="#labs" className="transition hover:text-primary">Labs</a>
            <a href="#portals" className="transition hover:text-primary">For each role</a>
            <a href="#collaboration" className="transition hover:text-primary">Collaboration</a>
            <a href="#how-it-works" className="transition hover:text-primary">How it works</a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            {isAuthenticated ? (
              <>
                <Link to={dashboardPaths[role]} className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-navy-900 transition hover:bg-slate-50 sm:inline-flex">
                  Dashboard
                </Link>
                <Link to={browsePath} className={primaryLinkClass}>
                  Browse labs <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="rounded-lg px-3 py-2 text-sm font-semibold text-navy-900 transition hover:bg-slate-50">
                  Sign in
                </Link>
                <Link to="/register" className={`${primaryLinkClass} px-4 sm:px-5`}>
                  <span className="hidden sm:inline">Create account</span>
                  <span className="sm:hidden">Join</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main id="main-content">
        <section className="relative isolate overflow-hidden bg-white">
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
            <div className="absolute -right-40 -top-56 h-[34rem] w-[34rem] rounded-full bg-sky-100/80 blur-3xl" />
            <div className="absolute -bottom-72 left-1/4 h-[28rem] w-[38rem] rounded-full bg-cyan-50 blur-3xl" />
          </div>

          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-8 lg:py-24">
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-primary">
                <Layers3 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{config.tagline}</span>
              </div>

              <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-navy-900 sm:text-5xl lg:text-[3.6rem]">
                Campus labs and
                <span className="mt-1 block text-primary">classwork, online.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-brand-muted sm:text-lg sm:leading-8">
                Faculty publish lab work and assignments. Students complete exercises, run code, and share work with their class.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to={browsePath} className={primaryLinkClass}>
                  {isAuthenticated ? 'Browse your labs' : 'Sign in to view labs'}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                {isAuthenticated ? (
                  <Link to={dashboardPaths[role]} className={secondaryLinkClass}>Go to dashboard</Link>
                ) : (
                  <Link to="/register" className={secondaryLinkClass}>
                    Student sign up
                  </Link>
                )}
              </div>

              {!isAuthenticated && (
                <p className="mt-4 text-sm text-brand-muted">
                  Setting up a campus?{' '}
                  <Link to="/institute/register" className="font-semibold text-primary underline decoration-blue-200 underline-offset-4 hover:text-primary-dark">
                    Register your institution
                  </Link>
                </p>
              )}

              <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-slate-200/80 pt-6 text-sm font-medium text-navy-800">
                <span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-teal-600" aria-hidden="true" />Lab exercises</span>
                <span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-teal-600" aria-hidden="true" />Code execution</span>
                <span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-teal-600" aria-hidden="true" />Class messaging</span>
              </div>
            </div>

            <div className="mx-auto w-full max-w-xl lg:ml-auto">
              <Card className="overflow-hidden rounded-2xl border-slate-200/90 shadow-floating">
                <div className="border-b border-slate-200/80 bg-slate-50/90 px-5 py-4">
                  <p className="text-sm font-semibold text-navy-900">Available workspace tools</p>
                  <p className="mt-1 text-xs text-brand-muted">The tools shown to a student depend on their class labs.</p>
                </div>
                <CardContent className="space-y-3 p-5 sm:p-7">
                  {[
                    { icon: Code2, title: 'Code editor', detail: 'Write and run programs in a browser workspace.' },
                    { icon: Database, title: 'SQL workspace', detail: 'Practice queries against example tables.' },
                    { icon: Cpu, title: 'Circuit simulator', detail: 'Build a circuit and inspect its output.' },
                  ].map(({ icon: Icon, title, detail }) => (
                    <div key={title} className="flex items-start gap-3 rounded-xl border border-slate-200 p-3.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-primary"><Icon className="h-4 w-4" aria-hidden="true" /></div>
                      <div><p className="text-sm font-semibold text-navy-900">{title}</p><p className="mt-1 text-xs leading-5 text-brand-muted">{detail}</p></div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="portals" className="scroll-mt-20 border-y border-slate-200/80 bg-brand-canvas px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <Badge variant="primary" size="sm">For each role</Badge>
              <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-navy-900 sm:text-3xl">Campus tools for students, faculty, and admins</h2>
              <p className="mt-2 text-sm leading-6 text-brand-muted sm:text-base">Each role has access to its classes, labs, and account tools.</p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <PortalPreview icon={Building2} eyebrow="Institute admin" title="Manage institute access" description="Create faculty accounts, classes, and lab access for your institute." modules={['Users', 'Classes', 'Labs']} action={isAuthenticated && role === 'admin' ? 'Open dashboard' : 'Register an institute'} to={isAuthenticated && role === 'admin' ? dashboardPaths.admin : '/institute/register'} />
              <PortalPreview icon={BookOpen} eyebrow="Faculty" title="Prepare class lab work" description="Publish lab exercises, create assignments, and review submissions." modules={['Classes', 'Lab exercises', 'Submissions']} action={isAuthenticated && role === 'teacher' ? 'Open dashboard' : 'Faculty sign in'} to={isAuthenticated && role === 'teacher' ? dashboardPaths.teacher : '/login'} />
              <PortalPreview icon={GraduationCap} eyebrow="Student" title="Complete class work" description="Open published labs, run code, and submit assignments." modules={['Classes', 'Labs', 'Assignments']} action={isAuthenticated && role === 'student' ? 'Open dashboard' : 'Create student account'} to={isAuthenticated && role === 'student' ? dashboardPaths.student : '/register'} />
            </div>
          </div>
        </section>

        <section id="labs" className="scroll-mt-20 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div className="max-w-2xl">
                <Badge variant="aqua" size="sm">Lab tools</Badge>
                <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-navy-900 sm:text-3xl">Tools used in class labs</h2>
                <p className="mt-2 text-sm leading-6 text-brand-muted sm:text-base">
                  Faculty can publish exercises that use the code editor, SQL workspace, or circuit simulator.
                </p>
              </div>
              <Link to={browsePath} className="inline-flex items-center gap-2 self-start text-sm font-semibold text-primary hover:text-primary-dark sm:self-auto">
                {isAuthenticated ? 'Open your labs' : 'Sign in to view labs'}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { icon: Code2, title: 'Code editor', detail: 'Write and run code for programming exercises.' },
                { icon: Database, title: 'SQL workspace', detail: 'Run SQL queries against local example tables.' },
                { icon: Cpu, title: 'Circuit simulator', detail: 'Connect components and inspect simulated output.' },
                { icon: BookOpenCheck, title: 'Guided exercises', detail: 'Follow instructions and submit your work.' },
              ].map(({ icon: Icon, title, detail }) => (
                <Card key={title} className="h-full border-slate-200/80"><CardContent className="p-5 sm:p-6"><div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-primary"><Icon className="h-5 w-5" aria-hidden="true" /></div><h3 className="mt-4 text-base font-bold text-navy-900">{title}</h3><p className="mt-2 text-sm leading-relaxed text-brand-muted">{detail}</p></CardContent></Card>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-20 border-y border-slate-200/80 bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <Badge variant="primary" size="sm">Getting started</Badge>
              <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-navy-900 sm:text-3xl">From class to practical work</h2>
              <p className="mt-2 text-sm leading-6 text-brand-muted sm:text-base">Set up an institute, publish class work, and review submissions.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <StepCard number="01" icon={Building2} title="Set up the institute" description="An admin registers the institute and adds approved student email domains." />
              <StepCard number="02" icon={FlaskConical} title="Publish class work" description="Faculty create a class, publish labs, and set assignments." />
              <StepCard number="03" icon={UsersRound} title="Complete assignments" description="Students work through exercises and submit their code for review." />
            </div>
          </div>
        </section>

        <section id="collaboration" className="scroll-mt-20 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-2xl bg-navy-950 px-6 py-8 text-white sm:px-10 sm:py-10">
            <div>
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-cyan-200">
                <UsersRound className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-200">Class collaboration</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Work with your class.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Share a coding session with classmates or ask your instructor for help.
              </p>
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-200">
                <span className="inline-flex items-center gap-2"><UsersRound className="h-4 w-4 text-cyan-200" aria-hidden="true" />Peer rooms</span>
                <span className="inline-flex items-center gap-2"><BookOpenCheck className="h-4 w-4 text-cyan-200" aria-hidden="true" />Faculty guidance</span>
                <span className="inline-flex items-center gap-2"><Code2 className="h-4 w-4 text-cyan-200" aria-hidden="true" />Shared workspaces</span>
              </div>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                {isAuthenticated ? (
                  <Link to={role === 'admin' ? dashboardPaths.admin : `${role === 'teacher' ? '/teacher' : '/student'}/collaboration`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-navy-900 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-white/70 focus:ring-offset-2 focus:ring-offset-navy-950">
                    {role === 'admin' ? 'Go to dashboard' : 'Open collaboration'} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                ) : (
                  <Link to="/student/collaboration" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-navy-900 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-white/70 focus:ring-offset-2 focus:ring-offset-navy-950">
                    Sign in to your workspace <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                )}
                {!isAuthenticated && <Link to="/register" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/20 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10">Create a student account</Link>}
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <Link to="/" className="flex items-center gap-2.5" aria-label={`${config.appName} home`}>
            <img src="/lumio-logo.svg" alt="" className="h-8 w-8 rounded-lg" />
            <div>
              <span className="text-sm font-bold text-navy-900">{config.appName}</span>
              <p className="text-xs text-brand-muted">{config.tagline}</p>
            </div>
          </Link>

          <nav aria-label="Footer navigation" className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-brand-muted">
            <Link to="/login" className="hover:text-primary">Sign in</Link>
            <Link to="/register" className="hover:text-primary">Student account</Link>
            <Link to="/institute/register" className="hover:text-primary">Register an institution</Link>
            <a href="#labs" className="hover:text-primary">Labs</a>
          </nav>

          <p className="text-xs text-brand-muted">© {new Date().getFullYear()} {config.appName}</p>
        </div>
      </footer>
    </div>
  );
};

function PortalPreview({
  icon: Icon,
  eyebrow,
  title,
  description,
  modules,
  action,
  to,
}: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  modules: string[];
  action: string;
  to: string;
}) {
  return (
    <Card className="flex h-full flex-col border-slate-200/80 shadow-subtle">
      <CardContent className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-primary">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">{eyebrow}</p>
            <p className="text-[11px] text-brand-muted">Workspace preview</p>
          </div>
        </div>
        <h3 className="mt-5 text-lg font-bold leading-snug text-navy-900">{title}</h3>
        <p className="mt-2 min-h-[3rem] text-sm leading-6 text-brand-muted">{description}</p>
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3" aria-label={`${eyebrow} workspace modules`}>
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Workspace</p>
          <ul className="space-y-1.5">
            {modules.map((module) => (
              <li key={module} className="flex items-center gap-2 rounded-lg bg-white px-2.5 py-2 text-xs font-medium text-navy-800 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-teal-500" aria-hidden="true" />{module}
              </li>
            ))}
          </ul>
        </div>
        <Link to={to} className="mt-auto inline-flex min-h-10 items-center justify-between gap-2 pt-5 text-sm font-semibold text-primary transition hover:text-primary-dark">
          {action}<ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
        </Link>
      </CardContent>
    </Card>
  );
}

function StepCard({ number, icon: Icon, title, description }: { number: string; icon: LucideIcon; title: string; description: string }) {
  return (
    <Card className="h-full border-slate-200/80">
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-primary">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
          <span className="text-sm font-bold tabular-nums text-slate-300">{number}</span>
        </div>
        <h3 className="mt-5 text-base font-bold text-navy-900">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-brand-muted">{description}</p>
      </CardContent>
    </Card>
  );
}

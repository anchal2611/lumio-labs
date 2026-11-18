import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Binary,
  BookOpenCheck,
  BookOpen,
  Braces,
  Building2,
  Check,
  Code2,
  Cpu,
  Database,
  FlaskConical,
  Globe,
  GraduationCap,
  Layers3,
  Network,
  UsersRound,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent } from '../../components/ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import { config } from '../../config/env';
import { MOCK_LABS } from '../../services/mockData';
import { LabItem } from '../../types/lab';
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

const labIcons: Record<string, LucideIcon> = {
  Code2,
  Cpu,
  Database,
  Zap,
  Globe,
  Binary,
  Network,
};

const categoryLabels: Record<LabItem['category'], string> = {
  programming: 'Programming',
  database: 'Database',
  web: 'Web development',
  iot: 'IoT & circuits',
  ai: 'Artificial intelligence',
  core_cs: 'Computer science',
};

const primaryLinkClass = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2';
const secondaryLinkClass = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-navy-900 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-2';

function getLabIcon(lab: LabItem): LucideIcon {
  return labIcons[lab.iconName] || FlaskConical;
}

function LabCard({ lab }: { lab: LabItem }) {
  const Icon = getLabIcon(lab);

  return (
    <Card className="h-full border-slate-200/80 shadow-subtle">
      <CardContent className="flex h-full flex-col p-5 sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-primary">
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
          <Badge variant="neutral" size="sm" className="capitalize">
            {lab.difficulty}
          </Badge>
        </div>

        <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">
          {categoryLabels[lab.category] || lab.category.replace(/_/g, ' ')}
        </p>
        <h3 className="mt-1.5 text-base font-bold leading-snug text-navy-900">{lab.name}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-brand-muted">{lab.tagline}</p>

        <div className="mt-5 flex flex-wrap gap-1.5" aria-label="Supported languages">
          {lab.languages.map((language) => (
            <Badge key={language} variant="info" size="sm" className="uppercase">
              {language}
            </Badge>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-brand-muted">
          <span>{lab.experimentCount} practicals</span>
          <span>{lab.estimatedHours} guided hours</span>
        </div>
      </CardContent>
    </Card>
  );
}

export const LandingPage: React.FC = () => {
  const { isAuthenticated, role } = useAuth();
  const allLabs = MOCK_LABS;
  const featuredLab = allLabs.find((lab) => lab.isPopular) || allLabs[0];
  const FeaturedIcon = featuredLab ? getLabIcon(featuredLab) : FlaskConical;
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
                Practical learning,
                <span className="mt-1 block text-primary">all in one place.</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-brand-muted sm:text-lg sm:leading-8">
                Run experiments, work through guided practicals, and learn with your class in a shared digital lab space.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to={browsePath} className={primaryLinkClass}>
                  {isAuthenticated ? 'Browse your labs' : 'Explore the labs'}
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
                <span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-teal-600" aria-hidden="true" />Guided practicals</span>
                <span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-teal-600" aria-hidden="true" />Open workspaces</span>
                <span className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-teal-600" aria-hidden="true" />Class collaboration</span>
              </div>
            </div>

            {featuredLab && (
              <div className="relative mx-auto w-full max-w-xl lg:ml-auto">
                <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-blue-100 via-cyan-50 to-teal-100 blur-xl" aria-hidden="true" />
                <Card className="overflow-hidden rounded-2xl border-slate-200/90 shadow-floating">
                  <div className="flex items-center justify-between border-b border-slate-200/80 bg-slate-50/90 px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white">
                        <FeaturedIcon className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-navy-900">Lab workspace</p>
                        <p className="text-[11px] text-brand-muted">A sample environment</p>
                      </div>
                    </div>
                    <Badge variant="neutral" size="sm">Sample lab</Badge>
                  </div>

                  <CardContent className="p-5 sm:p-7">
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">Featured lab</p>
                    <h2 className="mt-2 text-xl font-bold tracking-tight text-navy-900 sm:text-2xl">{featuredLab.name}</h2>
                    <p className="mt-2 text-sm leading-6 text-brand-muted">{featuredLab.description}</p>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <div className="rounded-xl border border-slate-200 bg-white p-3.5">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-muted">Practice modes</p>
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {featuredLab.supportedModes.map((mode) => (
                            <Badge key={mode} variant="primary" size="sm" className="capitalize">{mode}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-white p-3.5">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-muted">Tools</p>
                        <p className="mt-2 text-sm font-semibold text-navy-900">{featuredLab.tools.length} built in</p>
                        <p className="mt-0.5 truncate text-xs text-brand-muted">{featuredLab.tools.slice(0, 2).join(' · ')}</p>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                      <div className="flex items-center gap-4 text-xs text-brand-muted">
                        <span className="inline-flex items-center gap-1.5"><BookOpenCheck className="h-4 w-4 text-teal-600" aria-hidden="true" />{featuredLab.experimentCount} practicals</span>
                        <span className="inline-flex items-center gap-1.5"><Braces className="h-4 w-4 text-teal-600" aria-hidden="true" />{featuredLab.languages.join(' / ').toUpperCase()}</span>
                      </div>
                      <a href="#labs" className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-dark">
                        See all labs <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
                <div className="mt-3 flex items-center justify-center gap-2 text-xs text-brand-muted">
                  <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" />
                  Lab details are drawn from the platform catalog
                </div>
              </div>
            )}
          </div>
        </section>

        <section id="portals" className="scroll-mt-20 border-y border-slate-200/80 bg-brand-canvas px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <Badge variant="primary" size="sm">A quick look inside</Badge>
              <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-navy-900 sm:text-3xl">One platform, three connected workspaces</h2>
              <p className="mt-2 text-sm leading-6 text-brand-muted sm:text-base">See the tools each part of your campus uses to keep practical work moving.</p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <PortalPreview icon={Building2} eyebrow="Institute" title="A clearer campus overview" description="Organize people, classes, lab access, and institute settings from one place." modules={['User directory', 'Institute classes', 'Lab configuration']} action={isAuthenticated && role === 'admin' ? 'Open institute dashboard' : 'Register an institute'} to={isAuthenticated && role === 'admin' ? dashboardPaths.admin : '/institute/register'} />
              <PortalPreview icon={BookOpen} eyebrow="Faculty" title="Practical work your class can follow" description="Publish lab modules, set assignments, review submissions, and guide students." modules={['My classes', 'Lab modules', 'Assignments & grading']} action={isAuthenticated && role === 'teacher' ? 'Open faculty workspace' : 'Faculty sign in'} to={isAuthenticated && role === 'teacher' ? dashboardPaths.teacher : '/login'} />
              <PortalPreview icon={GraduationCap} eyebrow="Student" title="A workspace for each practical" description="Open class labs, work through exercises, submit assignments, and collaborate." modules={['My classes', 'Guided labs', 'Assignments & collaboration']} action={isAuthenticated && role === 'student' ? 'Open student workspace' : 'Create student account'} to={isAuthenticated && role === 'student' ? dashboardPaths.student : '/register'} />
            </div>
          </div>
        </section>

        <section id="labs" className="scroll-mt-20 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div className="max-w-2xl">
                <Badge variant="aqua" size="sm">Lab environments</Badge>
                <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-navy-900 sm:text-3xl">A workspace for every kind of practical</h2>
                <p className="mt-2 text-sm leading-6 text-brand-muted sm:text-base">
                  Browse the environments supported by LUMIO, from programming and databases to circuits and systems.
                </p>
              </div>
              <Link to={browsePath} className="inline-flex items-center gap-2 self-start text-sm font-semibold text-primary hover:text-primary-dark sm:self-auto">
                {isAuthenticated ? 'Open your labs' : 'Continue to lab access'}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {allLabs.map((lab) => <LabCard key={lab.id} lab={lab} />)}
              <Link to={browsePath} className="group flex h-full min-h-64 flex-col justify-between rounded-xl border border-dashed border-blue-200 bg-blue-50/70 p-5 transition hover:border-primary hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2 sm:p-6">
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-100 bg-white text-primary shadow-subtle"><FlaskConical className="h-5 w-5" aria-hidden="true" /></div>
                  <h3 className="mt-5 text-base font-bold text-navy-900">Your institute’s labs</h3>
                  <p className="mt-2 text-sm leading-relaxed text-brand-muted">Open the labs shared with your classes and continue into your workspace.</p>
                </div>
                <span className="mt-5 inline-flex items-center gap-2 border-t border-blue-100 pt-4 text-sm font-semibold text-primary group-hover:text-primary-dark">{isAuthenticated ? 'Browse your labs' : 'Sign in to browse'}<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" /></span>
              </Link>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-20 border-y border-slate-200/80 bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <Badge variant="primary" size="sm">Getting started</Badge>
              <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-navy-900 sm:text-3xl">From class to practical work</h2>
              <p className="mt-2 text-sm leading-6 text-brand-muted sm:text-base">Coursework, lab time, and collaboration stay connected in one place.</p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <StepCard number="01" icon={Building2} title="Join your institute" description="Students create an account with their campus email. Faculty and institute admins manage access through their institution." />
              <StepCard number="02" icon={FlaskConical} title="Open a class lab" description="Choose a published practical, follow its guide, or use the workspace to explore a problem on your own." />
              <StepCard number="03" icon={UsersRound} title="Work and share" description="Collaborate in real time, submit coursework, and keep feedback connected to the practical." />
            </div>
          </div>
        </section>

        <section id="collaboration" className="scroll-mt-20 px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-2xl bg-navy-950 px-6 py-8 text-white sm:px-10 sm:py-10">
            <div>
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-cyan-200">
                <UsersRound className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-200">Built for learning together</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Your lab work has a team around it.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Pair on code, ask faculty for help, and keep practical work connected to your classes.
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

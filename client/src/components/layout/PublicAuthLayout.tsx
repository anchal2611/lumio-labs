import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpenCheck, Code2, FlaskConical, UsersRound } from 'lucide-react';
import { config } from '../../config/env';

interface PublicAuthLayoutProps {
  children: React.ReactNode;
  panelTitle?: string;
  panelDescription?: string;
}

export const PublicAuthLayout: React.FC<PublicAuthLayoutProps> = ({
  children,
  panelTitle = 'A better place to do the practical work.',
  panelDescription = 'Bring classes, guided labs, assignments, and collaboration into one connected workspace.',
}) => (
  <div className="min-h-screen bg-brand-canvas text-brand-text">
    <header className="border-b border-slate-200/80 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center gap-2.5" aria-label={`${config.appName} home`}>
          <img src="/lumio-logo.svg" alt="" className="h-9 w-9 rounded-xl" />
          <span className="text-lg font-extrabold tracking-tight text-navy-900">{config.appName}</span>
        </Link>
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-muted transition hover:text-primary">
          Back to home <ArrowRight className="h-4 w-4 rotate-180" aria-hidden="true" />
        </Link>
      </div>
    </header>

    <main className="flex min-h-[calc(100svh-4rem)] items-start justify-center px-4 py-6 sm:px-6 sm:py-10 lg:items-center lg:px-8">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-floating lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="relative hidden min-h-[640px] flex-col justify-between overflow-hidden bg-navy-950 p-8 text-white lg:flex xl:p-10">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" aria-hidden="true" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-cyan-100">
              <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" />
              {config.brandStatement}
            </div>
            <h1 className="mt-8 max-w-sm text-3xl font-bold leading-tight tracking-tight xl:text-4xl">{panelTitle}</h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-slate-300">{panelDescription}</p>
          </div>

          <div className="relative space-y-3">
            <FeatureRow icon={BookOpenCheck} title="Guided practicals" description="Follow clear steps and check your work." />
            <FeatureRow icon={Code2} title="Hands-on workspaces" description="Run code, query data, and build circuits." />
            <FeatureRow icon={UsersRound} title="Connected classes" description="Share work with classmates and faculty." />
            <p className="pt-3 text-xs text-slate-500">Course content and access are managed by your institution.</p>
          </div>
        </aside>

        <section className="flex min-w-0 items-center justify-center p-5 sm:p-8 lg:p-10">
          <div className="w-full max-w-md">{children}</div>
        </section>
      </div>
    </main>
  </div>
);

function FeatureRow({ icon: Icon, title, description }: { icon: typeof FlaskConical; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-3.5">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-cyan-100">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="mt-0.5 text-xs leading-5 text-slate-400">{description}</p>
      </div>
    </div>
  );
}

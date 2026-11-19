import React from 'react';
import { FolderKanban } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';

export const StudentProjects: React.FC = () => (
  <div className="mx-auto max-w-4xl space-y-6">
    <header>
      <div className="mb-1 flex items-center gap-2">
        <FolderKanban className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-bold tracking-tight text-navy-900 sm:text-2xl">Group projects</h1>
      </div>
      <p className="text-sm text-brand-muted">Project work shared with your class.</p>
    </header>
    <Card>
      <CardContent className="px-6 py-14 text-center">
        <FolderKanban className="mx-auto mb-3 h-9 w-9 text-slate-300" />
        <h2 className="font-semibold text-navy-900">No group projects available</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-brand-muted">Projects will appear here once they are connected to your classes.</p>
      </CardContent>
    </Card>
  </div>
);

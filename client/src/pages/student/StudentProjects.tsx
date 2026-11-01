import React from 'react';
import { FolderKanban, Users, Github, ExternalLink, Plus, Sparkles } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const StudentProjects: React.FC = () => {
  const projects = [
    {
      id: 'proj-1',
      title: 'Smart Campus IoT Environmental Sensor Mesh',
      description: 'Distributed mesh network of ESP32 and BME280 sensor nodes monitoring classroom air quality and temperature with MQTT broker streaming.',
      team: ['Alex Chen', 'Priya Sharma', 'Liam O\'Connor'],
      lab: 'IoT & Virtual Circuit Laboratory',
      status: 'Active',
      deadline: 'Dec 10, 2026',
    },
    {
      id: 'proj-2',
      title: 'Automated Relational Database Migration & Query Engine',
      description: 'Custom C++ B-Tree storage engine implementing indexed sequential access method (ISAM) with LRU buffer caching.',
      team: ['Alex Chen', 'Maya Patel'],
      lab: 'Relational DBMS & SQL Lab',
      status: 'Milestone 2 Review',
      deadline: 'Dec 18, 2026',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FolderKanban className="w-5 h-5 text-primary" />
            <h1 className="text-xl sm:text-2xl font-bold text-navy-900 tracking-tight">
              Group Practical Projects
            </h1>
          </div>
          <p className="text-xs text-brand-muted">
            Collaborative capstone projects, team repos, and semester laboratory deliverables
          </p>
        </div>

        <Button size="sm" variant="primary" leftIcon={<Plus className="w-3.5 h-3.5" />}>
          New Group Project
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {projects.map((proj) => (
          <Card key={proj.id} className="border border-slate-200/80">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-2">
                <Badge variant="aqua" size="sm">
                  {proj.lab}
                </Badge>
                <Badge variant="primary" size="sm">
                  {proj.status}
                </Badge>
              </div>

              <div>
                <h3 className="text-base font-bold text-navy-900">{proj.title}</h3>
                <p className="text-xs text-brand-muted mt-1 leading-relaxed">
                  {proj.description}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-navy-900 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-teal-600" /> Team Collaborators:
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Due {proj.deadline}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {proj.team.map((member) => (
                    <span
                      key={member}
                      className="px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-700 text-[11px] font-medium"
                    >
                      {member}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Button size="sm" variant="outline" leftIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                  Project Workspace
                </Button>
                <span className="text-xs text-brand-aqua font-semibold">
                  Git Synced
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

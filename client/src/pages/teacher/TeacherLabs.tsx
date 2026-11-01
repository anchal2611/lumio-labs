import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FlaskConical, Plus, ArrowRight, Settings, Users, BookOpen } from 'lucide-react';
import { MOCK_LABS } from '../../services/mockData';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useLabStore } from '../../store/useLabStore';

export const TeacherLabs: React.FC = () => {
  const navigate = useNavigate();
  const { setActiveLab } = useLabStore();

  const handleLaunchLab = (lab: any) => {
    setActiveLab(lab);
    navigate(`/student/labs/${lab.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FlaskConical className="w-5 h-5 text-teal-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-navy-900 tracking-tight">
              My Teaching Laboratories
            </h1>
          </div>
          <p className="text-xs text-brand-muted">
            Configure practical modules, test student compiler environments, and inspect starter templates
          </p>
        </div>

        <Button size="sm" variant="accent" leftIcon={<Plus className="w-3.5 h-3.5" />}>
          Create New Lab Station
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_LABS.map((lab) => (
          <Card key={lab.id} className="border border-slate-200/80 flex flex-col justify-between">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <Badge variant="aqua" size="sm" className="capitalize">
                  {lab.category}
                </Badge>
                <span className="text-xs text-emerald-600 font-semibold">Active & Supervised</span>
              </div>

              <h3 className="text-base font-bold text-navy-900">{lab.name}</h3>
              <p className="text-xs text-brand-muted mt-1 leading-relaxed line-clamp-2">
                {lab.description}
              </p>

              <div className="flex items-center gap-1.5 flex-wrap mt-3">
                {lab.tools.map((t) => (
                  <span key={t} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono">
                    {t}
                  </span>
                ))}
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">
                  {lab.experimentCount} Practicals Configured
                </span>

                <Button
                  size="sm"
                  variant="outline"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  onClick={() => handleLaunchLab(lab)}
                >
                  Test Workspace
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LabItem } from '../../types/lab';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  Code2,
  Cpu,
  Database,
  Zap,
  Globe,
  Binary,
  Network,
  ArrowRight,
  Clock,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLabStore } from '../../store/useLabStore';

interface LabCardProps {
  lab: LabItem;
}

export const LabCard: React.FC<LabCardProps> = ({ lab }) => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const { setActiveLab } = useLabStore();

  const getIcon = () => {
    switch (lab.iconName) {
      case 'Code2':
        return <Code2 className="w-5 h-5 text-primary" />;
      case 'Cpu':
        return <Cpu className="w-5 h-5 text-sky-600" />;
      case 'Database':
        return <Database className="w-5 h-5 text-teal-600" />;
      case 'Zap':
        return <Zap className="w-5 h-5 text-amber-500" />;
      case 'Globe':
        return <Globe className="w-5 h-5 text-indigo-500" />;
      case 'Binary':
        return <Binary className="w-5 h-5 text-cyan-600" />;
      case 'Network':
        return <Network className="w-5 h-5 text-emerald-600" />;
      default:
        return <Code2 className="w-5 h-5 text-primary" />;
    }
  };

  const handleOpenLab = () => {
    setActiveLab(lab);
    const basePath = role === 'teacher' ? '/teacher/labs' : '/student/labs';
    navigate(`${basePath}/${lab.id}`);
  };

  return (
    <Card hoverable className="flex flex-col h-full border border-slate-200/80">
      <CardContent className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Header row */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center shrink-0">
              {getIcon()}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap justify-end">
              <Badge
                variant={
                  lab.difficulty === 'beginner'
                    ? 'success'
                    : lab.difficulty === 'intermediate'
                    ? 'primary'
                    : 'warning'
                }
                size="sm"
                className="capitalize"
              >
                {lab.difficulty}
              </Badge>
              {lab.isPopular && (
                <Badge variant="aqua" size="sm">
                  Popular
                </Badge>
              )}
            </div>
          </div>

          {/* Title & Tagline */}
          <h3 className="text-base font-bold text-navy-900 group-hover:text-primary transition-colors">
            {lab.name}
          </h3>
          <p className="text-xs text-brand-muted mt-1 leading-relaxed line-clamp-2">
            {lab.description}
          </p>

          {/* Tools / Features */}
          <div className="flex items-center gap-1.5 flex-wrap mt-4">
            {lab.tools.map((tool) => (
              <span
                key={tool}
                className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium"
              >
                {tool}
              </span>
            ))}
          </div>
        </div>

        {/* Footer Meta & Action */}
        <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              {lab.experimentCount} Practicals
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {lab.estimatedHours}h
            </span>
          </div>

          <Button
            size="sm"
            variant="outline"
            rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            onClick={handleOpenLab}
            className="hover:border-primary hover:text-primary"
          >
            Launch Lab
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

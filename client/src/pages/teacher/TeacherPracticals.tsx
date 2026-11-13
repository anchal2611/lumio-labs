import React, { useState, useEffect } from 'react';
import { FileText, Plus, BookOpen, Loader2, Sparkles, CheckCircle } from 'lucide-react';
import { apiGet } from '../../services/api';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../contexts/ToastContext';

interface PracticalExercise {
  id: string;
  practicalNumber: number;
  title: string;
  objective: string;
  defaultLanguage: string;
  maxMarks: number;
  labTitle?: string;
}

export const TeacherPracticals: React.FC = () => {
  const toast = useToast();
  const [practicals, setPracticals] = useState<PracticalExercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<{ labs: any[] }>('/labs')
      .then((res) => {
        const labs = res.labs || [];
        const extracted: PracticalExercise[] = [];
        let count = 1;
        for (const lab of labs) {
          if (Array.isArray(lab.exercises) && lab.exercises.length > 0) {
            for (const ex of lab.exercises) {
              extracted.push({
                id: ex.id || `prac-${count}`,
                practicalNumber: ex.order || count,
                title: ex.title || `Exercise #${count}`,
                objective: ex.description || `Practical implementation and verification for ${lab.title}.`,
                defaultLanguage: lab.language || 'python',
                maxMarks: ex.points || 10,
                labTitle: lab.title,
              });
              count++;
            }
          } else {
            extracted.push({
              id: lab.id,
              practicalNumber: count++,
              title: lab.title,
              objective: lab.description || 'Hands-on practical session in virtual laboratory.',
              defaultLanguage: lab.language || 'python',
              maxMarks: 20,
              labTitle: lab.title,
            });
          }
        }
        setPracticals(extracted);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-5 h-5 text-teal-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-navy-900 tracking-tight">
              Practical Syllabus Management
            </h1>
          </div>
          <p className="text-xs text-brand-muted">
            Live database syllabus: practical exercises, step-by-step procedures, and evaluations
          </p>
        </div>

        <Button
          size="sm"
          variant="accent"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => toast.info('Curriculum Authoring', 'Create new practical modules in the Lab Builder.')}
        >
          New Practical Exercise
        </Button>
      </div>

      {loading ? (
        <div className="flex min-h-48 items-center justify-center gap-2 text-sm text-brand-muted">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading practical exercises from active curriculum...
        </div>
      ) : practicals.length ? (
        <div className="space-y-4">
          {practicals.map((prac) => (
            <Card key={prac.id} className="border border-slate-200/80">
              <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <Badge variant="primary" size="sm">
                      Lab Practical #{prac.practicalNumber}
                    </Badge>
                    {prac.labTitle && (
                      <span className="text-xs font-semibold text-slate-500">
                        {prac.labTitle}
                      </span>
                    )}
                    <span className="text-xs font-semibold text-slate-500 uppercase font-mono">
                      {prac.defaultLanguage}
                    </span>
                    <span className="text-xs font-semibold text-emerald-600">
                      Max: {prac.maxMarks} marks
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-navy-900 leading-snug">{prac.title}</h3>
                  <p className="text-xs text-brand-muted leading-relaxed line-clamp-2">
                    {prac.objective}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<BookOpen className="w-3.5 h-3.5" />}
                    onClick={() => toast.info('Previewing Curriculum', `Viewing evaluation schema for ${prac.title}`)}
                  >
                    View Procedure
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <FileText className="mx-auto mb-3 h-9 w-9 text-slate-300" />
          <h2 className="font-semibold text-navy-900">No practicals found</h2>
          <p className="mt-1 text-sm text-brand-muted">Create a lab module to generate practical curriculum.</p>
        </div>
      )}
    </div>
  );
};

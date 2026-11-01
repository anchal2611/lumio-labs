import React, { useState } from 'react';
import { FileText, Plus, Edit3, Trash2, CheckCircle, Sparkles, BookOpen } from 'lucide-react';
import { MOCK_GUIDED_PRACTICALS } from '../../services/mockData';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../contexts/ToastContext';

export const TeacherPracticals: React.FC = () => {
  const toast = useToast();
  const allPracticals = Object.values(MOCK_GUIDED_PRACTICALS).flat();

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
            Author and publish guided lab exercises, step-by-step procedures, and viva voce quizzes
          </p>
        </div>

        <Button
          size="sm"
          variant="accent"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => toast.info('Feature Ready', 'Use practical authoring form to append curriculum.')}
        >
          New Practical Exercise
        </Button>
      </div>

      <div className="space-y-4">
        {allPracticals.map((prac) => (
          <Card key={prac.id} className="border border-slate-200/80">
            <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center gap-2">
                  <Badge variant="primary" size="sm">
                    Lab Practical #{prac.practicalNumber}
                  </Badge>
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
                <Button size="sm" variant="outline" leftIcon={<Edit3 className="w-3.5 h-3.5" />}>
                  Edit Steps
                </Button>
                <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

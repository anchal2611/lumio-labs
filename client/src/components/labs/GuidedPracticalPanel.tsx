import React, { useState } from 'react';
import { GuidedPractical } from '../../types/lab';
import {
  BookOpen,
  CheckCircle2,
  HelpCircle,
  Award,
  ChevronRight,
  Sparkles,
  Info,
  ListOrdered,
} from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface GuidedPracticalPanelProps {
  practical: GuidedPractical;
  onApplyStarterCode: () => void;
}

export const GuidedPracticalPanel: React.FC<GuidedPracticalPanelProps> = ({
  practical,
  onApplyStarterCode,
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showExplanations, setShowExplanations] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'instructions' | 'viva'>('instructions');

  const handleSelectOption = (questionId: string, option: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [questionId]: option }));
    setShowExplanations((prev) => ({ ...prev, [questionId]: true }));
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200/80 shadow-subtle overflow-hidden">
      {/* Panel Header */}
      <div className="p-4 bg-slate-50 border-b border-slate-200/80">
        <div className="flex items-center justify-between gap-2 mb-2">
          <Badge variant="primary" size="sm">
            Practical #{practical.practicalNumber}
          </Badge>
          <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            <Award className="w-3.5 h-3.5" />
            <span>Max Marks: {practical.maxMarks}</span>
          </div>
        </div>
        <h3 className="text-sm font-bold text-navy-900 leading-snug">{practical.title}</h3>

        {/* Tab Strip */}
        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-slate-200/60">
          <button
            onClick={() => setActiveTab('instructions')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'instructions'
                ? 'bg-white text-navy-900 font-semibold shadow-2xs border border-slate-200'
                : 'text-brand-muted hover:text-navy-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-primary" />
            <span>Instructions & Steps</span>
          </button>
          <button
            onClick={() => setActiveTab('viva')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              activeTab === 'viva'
                ? 'bg-white text-navy-900 font-semibold shadow-2xs border border-slate-200'
                : 'text-brand-muted hover:text-navy-900'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-teal-600" />
            <span>Viva Voce Quiz ({practical.vivaQuestions.length})</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto space-y-5 text-xs leading-relaxed">
        {activeTab === 'instructions' ? (
          <>
            {/* Objective */}
            <div>
              <h4 className="font-bold text-navy-900 uppercase tracking-wider text-[11px] mb-1.5 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-primary" />
                <span>Objective</span>
              </h4>
              <p className="text-slate-700 bg-blue-50/50 p-2.5 rounded-lg border border-blue-100/80">
                {practical.objective}
              </p>
            </div>

            {/* Theory */}
            <div>
              <h4 className="font-bold text-navy-900 uppercase tracking-wider text-[11px] mb-1.5 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-teal-600" />
                <span>Theory & Background</span>
              </h4>
              <p className="text-brand-muted">{practical.theory}</p>
            </div>

            {/* Procedure */}
            <div>
              <h4 className="font-bold text-navy-900 uppercase tracking-wider text-[11px] mb-1.5 flex items-center gap-1.5">
                <ListOrdered className="w-3.5 h-3.5 text-sky-600" />
                <span>Step-by-Step Procedure</span>
              </h4>
              <div className="space-y-1.5">
                {practical.procedure.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200/60">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <span className="text-slate-700 font-medium">{step}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Expected Output */}
            <div>
              <h4 className="font-bold text-navy-900 uppercase tracking-wider text-[11px] mb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Expected Verification Output</span>
              </h4>
              <pre className="p-3 bg-navy-950 text-emerald-400 font-mono text-[11px] rounded-lg overflow-x-auto whitespace-pre-wrap border border-navy-800">
                {practical.expectedOutput}
              </pre>
            </div>

            {/* Reset to starter code action */}
            <div className="pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={onApplyStarterCode}
                className="w-full text-xs"
              >
                Reload Starter Template into Editor
              </Button>
            </div>
          </>
        ) : (
          /* Viva Voce Questions */
          <div className="space-y-4">
            <p className="text-brand-muted text-[11px]">
              Answer these faculty oral exam (viva voce) questions to verify your theoretical understanding:
            </p>

            {practical.vivaQuestions.map((q, idx) => {
              const selected = selectedAnswers[q.id];
              const isAnswered = Boolean(selected);
              const isCorrect = selected === q.correctAnswer;

              return (
                <div
                  key={q.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2.5"
                >
                  <p className="font-semibold text-navy-900">
                    {idx + 1}. {q.question}
                  </p>

                  {q.options && (
                    <div className="space-y-1.5">
                      {q.options.map((opt) => {
                        const isChosen = selected === opt;
                        const isThisCorrect = opt === q.correctAnswer;

                        return (
                          <button
                            key={opt}
                            onClick={() => handleSelectOption(q.id, opt)}
                            className={`w-full text-left p-2 rounded-lg text-xs transition-all border flex items-center justify-between ${
                              isChosen
                                ? isThisCorrect
                                  ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold'
                                  : 'bg-rose-50 border-rose-400 text-rose-900 font-semibold'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <span>{opt}</span>
                            {isChosen && (
                              <span>{isThisCorrect ? '✓ Correct' : '✗ Incorrect'}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {showExplanations[q.id] && (
                    <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg text-[11px] text-blue-900 leading-snug">
                      <span className="font-bold">Faculty Explanation: </span>
                      {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

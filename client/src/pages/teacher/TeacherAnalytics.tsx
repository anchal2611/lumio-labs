import React from 'react';
import { BarChart3, TrendingUp, Users, CheckCircle2, Award, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export const TeacherAnalytics: React.FC = () => {
  const labMetrics = [
    { name: 'Python Computing & Algorithms', avgScore: '88.4%', submissions: 42, onTime: '95%' },
    { name: 'C / C++ Systems Lab', avgScore: '84.2%', submissions: 38, onTime: '89%' },
    { name: 'Relational DBMS & SQL Lab', avgScore: '91.0%', submissions: 41, onTime: '98%' },
    { name: 'IoT & Virtual Circuit Laboratory', avgScore: '86.7%', submissions: 35, onTime: '92%' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-5 h-5 text-teal-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-navy-900 tracking-tight">
              Class Academic Analytics
            </h1>
          </div>
          <p className="text-xs text-brand-muted">
            Aggregated laboratory completion benchmarks, grade distribution, and practical timings
          </p>
        </div>

        <Badge variant="aqua" size="md">
          Spring Term 2026 Batch
        </Badge>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="border border-slate-200/80">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-brand-muted font-medium">Department Class Average</p>
              <h3 className="text-2xl font-extrabold text-navy-900 mt-0.5">87.6%</h3>
              <span className="text-[10px] text-emerald-600 font-bold">+3.2% vs last semester</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-primary flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-brand-muted font-medium">On-Time Submissions</p>
              <h3 className="text-2xl font-extrabold text-navy-900 mt-0.5">93.5%</h3>
              <span className="text-[10px] text-emerald-600 font-bold">142 of 152 on schedule</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-brand-muted font-medium">Viva Voce Accuracy</p>
              <h3 className="text-2xl font-extrabold text-navy-900 mt-0.5">91.2%</h3>
              <span className="text-[10px] text-amber-700 font-bold">Strong conceptual grasp</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lab Breakdown Table */}
      <Card className="border border-slate-200/80">
        <CardHeader>
          <CardTitle>Per-Laboratory Performance Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100/70 text-navy-900 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Laboratory Name</th>
                <th className="p-3.5">Submissions</th>
                <th className="p-3.5">Average Score</th>
                <th className="p-3.5">On-Time Rate</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {labMetrics.map((m) => (
                <tr key={m.name} className="hover:bg-slate-50">
                  <td className="p-3.5 font-bold text-navy-900">{m.name}</td>
                  <td className="p-3.5 font-mono text-slate-700">{m.submissions} / 45</td>
                  <td className="p-3.5 font-bold text-teal-700">{m.avgScore}</td>
                  <td className="p-3.5 text-slate-700">{m.onTime}</td>
                  <td className="p-3.5">
                    <Badge variant="success" size="sm">
                      Satisfactory
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

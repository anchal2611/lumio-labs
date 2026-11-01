import React from 'react';
import { ClipboardList, CheckCircle } from 'lucide-react';
import { MOCK_ASSIGNMENTS } from '../../services/mockData';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export const AdminAssignments: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <ClipboardList className="w-5 h-5 text-amber-600" />
          <h1 className="text-xl sm:text-2xl font-bold text-navy-900 tracking-tight">
            Institutional Assignment Compliance
          </h1>
        </div>
        <p className="text-xs text-brand-muted">
          University-wide examination and laboratory coursework delivery monitoring
        </p>
      </div>

      <Card className="border border-slate-200/80">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-100/70 text-navy-900 uppercase text-[10px] font-bold border-b border-slate-200">
            <tr>
              <th className="p-3.5">Assignment</th>
              <th className="p-3.5">Department</th>
              <th className="p-3.5">Faculty Lead</th>
              <th className="p-3.5">Submissions</th>
              <th className="p-3.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {MOCK_ASSIGNMENTS.map((asg) => (
              <tr key={asg.id} className="hover:bg-slate-50">
                <td className="p-3.5 font-bold text-navy-900">{asg.title}</td>
                <td className="p-3.5 text-slate-600">{asg.department}</td>
                <td className="p-3.5 text-slate-800 font-medium">{asg.teacherName}</td>
                <td className="p-3.5 font-mono text-teal-700 font-bold">
                  {asg.submissionCount} / {asg.totalStudents}
                </td>
                <td className="p-3.5">
                  <Badge variant="success" size="sm">
                    Published
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

import React from 'react';
import { GraduationCap } from 'lucide-react';
import { MOCK_STUDENTS_LIST } from '../../services/mockData';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export const AdminStudents: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <GraduationCap className="w-5 h-5 text-amber-600" />
          <h1 className="text-xl sm:text-2xl font-bold text-navy-900 tracking-tight">
            Student Account Administration
          </h1>
        </div>
        <p className="text-xs text-brand-muted">
          Oversee student enrollment batches, department allocations, and access privileges
        </p>
      </div>

      <Card className="border border-slate-200/80">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-100/70 text-navy-900 uppercase text-[10px] font-bold border-b border-slate-200">
            <tr>
              <th className="p-3.5">Name</th>
              <th className="p-3.5">Roll No</th>
              <th className="p-3.5">Department</th>
              <th className="p-3.5">Semester</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {MOCK_STUDENTS_LIST.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50">
                <td className="p-3.5 font-bold text-navy-900">{s.name}</td>
                <td className="p-3.5 font-mono text-slate-600">{s.rollNumber}</td>
                <td className="p-3.5 text-slate-700">{s.department}</td>
                <td className="p-3.5 font-semibold">Sem {s.semester}</td>
                <td className="p-3.5">
                  <Badge variant="success" size="sm">
                    Active
                  </Badge>
                </td>
                <td className="p-3.5 text-right">
                  <Button size="sm" variant="outline" className="text-xs">
                    Inspect
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

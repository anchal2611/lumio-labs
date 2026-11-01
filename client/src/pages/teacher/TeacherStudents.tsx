import React, { useState } from 'react';
import { GraduationCap, Search, Mail, ExternalLink, Award, CheckCircle2 } from 'lucide-react';
import { MOCK_STUDENTS_LIST } from '../../services/mockData';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const TeacherStudents: React.FC = () => {
  const [search, setSearch] = useState('');

  const filtered = MOCK_STUDENTS_LIST.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.rollNumber && s.rollNumber.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap className="w-5 h-5 text-teal-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-navy-900 tracking-tight">
              Assigned Students Directory
            </h1>
          </div>
          <p className="text-xs text-brand-muted">
            Track student lab attendance, experiment milestones, and individual academic portfolios
          </p>
        </div>

        <div className="w-full sm:w-64">
          <Input
            placeholder="Search student or roll no..."
            leftIcon={<Search className="w-4 h-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card className="border border-slate-200/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100/70 text-navy-900 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3.5">Student</th>
                <th className="p-3.5">Roll Number</th>
                <th className="p-3.5">Branch / Program</th>
                <th className="p-3.5">Semester</th>
                <th className="p-3.5">Submission Rate</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3.5">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={s.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={s.name}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-bold text-navy-900">{s.name}</h4>
                        <p className="text-[10px] text-slate-400 font-mono">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5 font-mono text-slate-700">{s.rollNumber || 'CS-2024-042'}</td>
                  <td className="p-3.5 text-slate-600 font-medium">{s.branch || 'Software Eng'}</td>
                  <td className="p-3.5 font-medium text-navy-900">Sem {s.semester || 4}</td>
                  <td className="p-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div className="bg-teal-600 h-full w-[90%]" />
                      </div>
                      <span className="font-semibold text-teal-700 text-[11px]">90%</span>
                    </div>
                  </td>
                  <td className="p-3.5">
                    <Badge variant="success" size="sm">
                      Active
                    </Badge>
                  </td>
                  <td className="p-3.5 text-right">
                    <Button size="sm" variant="outline" className="text-xs">
                      View Progress
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

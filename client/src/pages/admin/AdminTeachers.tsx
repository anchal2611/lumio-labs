import React from 'react';
import { Users, CheckCircle, ShieldAlert } from 'lucide-react';
import { DEMO_USERS } from '../../services/mockData';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export const AdminTeachers: React.FC = () => {
  const teachers = [
    DEMO_USERS.teacher,
    {
      id: 'usr_t2',
      name: 'Dr. Eleanor Brooks',
      email: 'eleanor.brooks@university.edu',
      department: 'Computer Science & Engineering',
      designation: 'Associate Professor',
      isVerified: true,
      status: 'active',
      joinedAt: '2022-01-15T09:00:00Z',
    },
    {
      id: 'usr_t3',
      name: 'Dr. Aris Thorne',
      email: 'aris.thorne@university.edu',
      department: 'Electrical Engineering',
      designation: 'Hardware Lab Chair',
      isVerified: true,
      status: 'active',
      joinedAt: '2020-08-01T09:00:00Z',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Users className="w-5 h-5 text-amber-600" />
          <h1 className="text-xl sm:text-2xl font-bold text-navy-900 tracking-tight">
            Faculty Verification & Credentials
          </h1>
        </div>
        <p className="text-xs text-brand-muted">
          Manage teacher elevated evaluation privileges, digital signatures, and laboratory director roles
        </p>
      </div>

      <Card className="border border-slate-200/80">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-100/70 text-navy-900 uppercase text-[10px] font-bold border-b border-slate-200">
            <tr>
              <th className="p-3.5">Faculty Member</th>
              <th className="p-3.5">Designation</th>
              <th className="p-3.5">Department</th>
              <th className="p-3.5">Verification</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {teachers.map((t) => (
              <tr key={t.id} className="hover:bg-slate-50">
                <td className="p-3.5">
                  <div className="font-bold text-navy-900">{t.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{t.email}</div>
                </td>
                <td className="p-3.5 text-slate-700">{t.designation}</td>
                <td className="p-3.5 text-slate-600">{t.department}</td>
                <td className="p-3.5">
                  <Badge variant="success" size="sm">
                    Verified Faculty
                  </Badge>
                </td>
                <td className="p-3.5 text-right">
                  <Button size="sm" variant="outline" className="text-xs">
                    Permissions
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

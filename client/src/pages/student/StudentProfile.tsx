import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, GraduationCap, Building2, Mail, ShieldCheck, Calendar, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export const StudentProfile: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <User className="w-5 h-5 text-primary" />
          <h1 className="text-xl sm:text-2xl font-bold text-navy-900 tracking-tight">
            Academic Profile
          </h1>
        </div>
        <p className="text-xs text-brand-muted">
          Your university identity, laboratory attendance credentials, and enrollment record
        </p>
      </div>

      <Card className="border border-slate-200/80">
        <CardContent className="p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-slate-100 text-center sm:text-left">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
              alt={user?.name}
              className="w-24 h-24 rounded-full object-cover ring-4 ring-primary/10 shadow-elevated"
            />
            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl font-bold text-navy-900">{user?.name}</h2>
                <Badge variant="success" size="sm">
                  Verified Student
                </Badge>
              </div>
              <p className="text-xs text-brand-muted font-mono">{user?.rollNumber || 'CS-2024-042'}</p>
              <p className="text-xs text-slate-600 font-medium">
                {user?.department} • Semester {user?.semester || 4}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 text-xs">
            <div className="space-y-4">
              <div>
                <span className="text-slate-400 block mb-0.5">University Institution:</span>
                <span className="font-semibold text-navy-900">{user?.university}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">University Email:</span>
                <span className="font-mono text-navy-900">{user?.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Specialization Branch:</span>
                <span className="font-semibold text-navy-900">{user?.branch || 'Software Engineering'}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-slate-400 block mb-0.5">Account Status:</span>
                <span className="font-semibold text-emerald-600">Active Lab Privileges</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Enrolled Semester:</span>
                <span className="font-semibold text-navy-900">Spring Term 2026</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Lab Station Permissions:</span>
                <span className="font-semibold text-navy-900">C/C++, Python, SQLite, ESP32 Virtual</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

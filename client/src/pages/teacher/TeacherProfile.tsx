import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, BookOpen, Award, Mail, Building2 } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

export const TeacherProfile: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <User className="w-5 h-5 text-teal-600" />
          <h1 className="text-xl sm:text-2xl font-bold text-navy-900 tracking-tight">
            Faculty Profile & Lab Directorate
          </h1>
        </div>
        <p className="text-xs text-brand-muted">
          Your university academic credentials, office hours, and laboratory supervision records
        </p>
      </div>

      <Card className="border border-slate-200/80">
        <CardContent className="p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-slate-100 text-center sm:text-left">
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
              alt={user?.name}
              className="w-24 h-24 rounded-full object-cover ring-4 ring-teal-500/10 shadow-elevated"
            />
            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl font-bold text-navy-900">{user?.name}</h2>
                <Badge variant="aqua" size="sm">
                  Verified Faculty Director
                </Badge>
              </div>
              <p className="text-xs text-brand-muted">{user?.designation || 'Associate Professor'}</p>
              <p className="text-xs text-slate-600 font-medium">{user?.department}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 text-xs">
            <div className="space-y-4">
              <div>
                <span className="text-slate-400 block mb-0.5">University:</span>
                <span className="font-semibold text-navy-900">{user?.university}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Faculty Email:</span>
                <span className="font-mono text-navy-900">{user?.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Office Hours:</span>
                <span className="font-semibold text-navy-900">Tuesdays & Thursdays, 2:00 PM – 4:30 PM</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-slate-400 block mb-0.5">Lab Station Supervisions:</span>
                <span className="font-semibold text-navy-900">C/C++ Low-Level Systems, Relational DBMS</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Department:</span>
                <span className="font-semibold text-navy-900">{user?.department}</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Digital Signatures:</span>
                <span className="font-semibold text-emerald-600">Verified GPG Key Enrolled</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

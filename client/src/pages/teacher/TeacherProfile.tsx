import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, Building2, BriefcaseBusiness } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/Card';

export const TeacherProfile: React.FC = () => {
  const { user } = useAuth();
  const designation = user?.profile?.designation || user?.designation;
  const department = user?.profile?.department || user?.department;
  const employeeId = user?.profile?.employeeId;
  const institute = user?.institute?.name || user?.university;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <User className="w-5 h-5 text-teal-600" />
          <h1 className="text-xl sm:text-2xl font-bold text-navy-900 tracking-tight">Faculty profile</h1>
        </div>
        <p className="text-sm text-brand-muted">Account details for your faculty account.</p>
      </div>

      <Card className="border border-slate-200/80">
        <CardContent className="p-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-slate-100 text-center sm:text-left">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="h-20 w-20 rounded-full object-cover ring-4 ring-teal-500/10" />
            ) : (
              <div aria-hidden="true" className="flex h-20 w-20 items-center justify-center rounded-full bg-teal-50 text-2xl font-semibold text-teal-700 ring-4 ring-teal-500/10">
                {user?.name?.trim().charAt(0).toUpperCase() || 'F'}
              </div>
            )}
            <div className="space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl font-bold text-navy-900">{user?.name || 'Faculty member'}</h2>
              </div>
              {designation && <p className="text-sm text-brand-muted">{designation}</p>}
              {department && <p className="text-sm font-medium text-slate-600">{department}</p>}
            </div>
          </div>

          <dl className="grid grid-cols-1 gap-5 pt-6 text-sm sm:grid-cols-2">
            <ProfileField icon={Mail} label="Email" value={user?.email} />
            <ProfileField icon={Building2} label="Institute" value={institute} />
            <ProfileField icon={BriefcaseBusiness} label="Department" value={department} />
            <ProfileField icon={User} label="Employee ID" value={employeeId} />
          </dl>
        </CardContent>
      </Card>
    </div>
  );
};

function ProfileField({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string | null }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
      <div className="min-w-0">
        <dt className="text-xs text-slate-500">{label}</dt>
        <dd className="mt-1 break-words font-medium text-navy-900">{value || 'Not provided'}</dd>
      </div>
    </div>
  );
}

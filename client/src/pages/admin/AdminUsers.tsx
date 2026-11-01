import React, { useState } from 'react';
import { ShieldCheck, Search, Plus, CheckCircle, Ban, Trash2, Edit } from 'lucide-react';
import { MOCK_STUDENTS_LIST, DEMO_USERS } from '../../services/mockData';
import { Card, CardContent } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../contexts/ToastContext';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState([
    DEMO_USERS.student,
    DEMO_USERS.teacher,
    DEMO_USERS.admin,
    ...MOCK_STUDENTS_LIST.slice(1),
  ]);
  const [search, setSearch] = useState('');
  const toast = useToast();

  const handleToggleVerify = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, isVerified: !u.isVerified } : u))
    );
    toast.success('User Updated', 'Verification status modified.');
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-amber-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-navy-900 tracking-tight">
              Institutional User Directory
            </h1>
          </div>
          <p className="text-xs text-brand-muted">
            Manage university student accounts, faculty verification credentials, and administrative roles
          </p>
        </div>

        <div className="w-full sm:w-64">
          <Input
            placeholder="Search users..."
            leftIcon={<Search className="w-4 h-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Card className="border border-slate-200/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100/70 text-navy-900 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">User</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Joined Date</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3.5">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={u.name}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="font-bold text-navy-900">{u.name}</h4>
                        <p className="text-[10px] text-slate-400 font-mono">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5">
                    <Badge
                      variant={u.role === 'admin' ? 'warning' : u.role === 'teacher' ? 'aqua' : 'primary'}
                      size="sm"
                      className="capitalize"
                    >
                      {u.role}
                    </Badge>
                  </td>
                  <td className="p-3.5 text-slate-600 font-medium">{u.department}</td>
                  <td className="p-3.5 text-slate-400">
                    {new Date(u.joinedAt).toLocaleDateString()}
                  </td>
                  <td className="p-3.5">
                    <button
                      onClick={() => handleToggleVerify(u.id)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                        u.isVerified
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                      }`}
                    >
                      {u.isVerified ? 'Verified' : 'Pending Verification'}
                    </button>
                  </td>
                  <td className="p-3.5 text-right">
                    <Button size="sm" variant="ghost" className="text-xs">
                      Edit
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

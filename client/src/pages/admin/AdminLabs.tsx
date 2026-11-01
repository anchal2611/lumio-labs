import React from 'react';
import { FlaskConical, Plus, Settings } from 'lucide-react';
import { MOCK_LABS } from '../../services/mockData';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export const AdminLabs: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FlaskConical className="w-5 h-5 text-amber-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-navy-900 tracking-tight">
              Laboratory Station Provisioning
            </h1>
          </div>
          <p className="text-xs text-brand-muted">
            Configure compiler sandbox quotas, WASM memory allocations, and module toggles
          </p>
        </div>

        <Button size="sm" variant="accent" leftIcon={<Plus className="w-3.5 h-3.5" />}>
          Deploy New Lab Instance
        </Button>
      </div>

      <Card className="border border-slate-200/80">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-100/70 text-navy-900 uppercase text-[10px] font-bold border-b border-slate-200">
            <tr>
              <th className="p-3.5">Lab Name</th>
              <th className="p-3.5">Category</th>
              <th className="p-3.5">Engine / Tools</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Settings</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {MOCK_LABS.map((lab) => (
              <tr key={lab.id} className="hover:bg-slate-50">
                <td className="p-3.5 font-bold text-navy-900">{lab.name}</td>
                <td className="p-3.5 capitalize font-medium">{lab.category}</td>
                <td className="p-3.5 font-mono text-[11px] text-slate-600">
                  {lab.tools.join(', ')}
                </td>
                <td className="p-3.5">
                  <Badge variant="aqua" size="sm">
                    Operational
                  </Badge>
                </td>
                <td className="p-3.5 text-right">
                  <Button size="sm" variant="outline" className="text-xs">
                    Configure
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

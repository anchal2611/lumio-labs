import React from 'react';
import { History, ShieldAlert, Download, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export const AdminReports: React.FC = () => {
  const auditLogs = [
    {
      id: 'log-1',
      timestamp: '2026-11-01 17:45:10',
      action: 'ROLE_ELEVATION',
      user: 'dean.jenkins@university.edu',
      target: 'marcus.vance@university.edu',
      ip: '192.168.1.104',
      status: 'SUCCESS',
      details: 'Assigned Systems Lab Director permissions.',
    },
    {
      id: 'log-2',
      timestamp: '2026-11-01 16:20:45',
      action: 'PRACTICAL_PUBLISH',
      user: 'marcus.vance@university.edu',
      target: 'CS402-DSA',
      ip: '192.168.1.189',
      status: 'SUCCESS',
      details: 'Published Practical 3 AVL tree balancing exercise.',
    },
    {
      id: 'log-3',
      timestamp: '2026-11-01 15:10:02',
      action: 'SANDBOX_EXECUTION',
      user: 'alex.chen@university.edu',
      target: 'Python 3.11 Sandbox',
      ip: '10.0.4.15',
      status: 'SUCCESS',
      details: 'Executed 12 test vectors (elapsed: 24ms).',
    },
    {
      id: 'log-4',
      timestamp: '2026-11-01 14:02:18',
      action: 'SQLITE_WASM_BOOT',
      user: 'liam.oconnor@university.edu',
      target: 'University DB',
      ip: '10.0.4.22',
      status: 'SUCCESS',
      details: 'WASM memory initialized with 5 relational tables.',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <History className="w-5 h-5 text-amber-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-navy-900 tracking-tight">
              Administrative Security Audit Trail
            </h1>
          </div>
          <p className="text-xs text-brand-muted">
            Immutable system logs tracking role changes, practical publications, and security events
          </p>
        </div>

        <Button size="sm" variant="outline" leftIcon={<Download className="w-3.5 h-3.5" />}>
          Export Audit CSV
        </Button>
      </div>

      <Card className="border border-slate-200/80">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100/70 text-navy-900 uppercase text-[10px] font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">Action Code</th>
                <th className="p-3.5">Initiator</th>
                <th className="p-3.5">Target Entity</th>
                <th className="p-3.5">IP Address</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="p-3.5 text-slate-500 whitespace-nowrap">{log.timestamp}</td>
                  <td className="p-3.5 font-bold text-navy-900">{log.action}</td>
                  <td className="p-3.5 text-slate-700">{log.user}</td>
                  <td className="p-3.5 text-slate-600">{log.target}</td>
                  <td className="p-3.5 text-slate-400">{log.ip}</td>
                  <td className="p-3.5">
                    <Badge variant="success" size="sm">
                      {log.status}
                    </Badge>
                  </td>
                  <td className="p-3.5 font-sans text-xs text-slate-700">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

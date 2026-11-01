import React from 'react';
import { Activity, Radio, Users } from 'lucide-react';
import { MOCK_COLLAB_ROOMS } from '../../services/mockData';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export const AdminSessions: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Activity className="w-5 h-5 text-amber-600" />
          <h1 className="text-xl sm:text-2xl font-bold text-navy-900 tracking-tight">
            Active Real-Time WebSocket Sessions
          </h1>
        </div>
        <p className="text-xs text-brand-muted">
          Inspect ongoing collaborative code rooms, participant sockets, and sync health
        </p>
      </div>

      <Card className="border border-slate-200/80">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-100/70 text-navy-900 uppercase text-[10px] font-bold border-b border-slate-200">
            <tr>
              <th className="p-3.5">Room Code</th>
              <th className="p-3.5">Session Name</th>
              <th className="p-3.5">Host</th>
              <th className="p-3.5">Language</th>
              <th className="p-3.5">Active Peers</th>
              <th className="p-3.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {MOCK_COLLAB_ROOMS.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className="p-3.5 font-mono font-bold text-primary">{r.roomCode}</td>
                <td className="p-3.5 font-bold text-navy-900">{r.title}</td>
                <td className="p-3.5 text-slate-700">{r.hostName}</td>
                <td className="p-3.5 uppercase font-mono text-slate-600">{r.language}</td>
                <td className="p-3.5 font-bold text-teal-700">{r.participants.length} Online</td>
                <td className="p-3.5">
                  <Badge variant="success" size="sm">
                    Synchronized
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

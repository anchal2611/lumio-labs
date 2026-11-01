import React from 'react';
import { BookMarked, HardDrive, ShieldCheck } from 'lucide-react';
import { MOCK_RESOURCES } from '../../services/mockData';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export const AdminResources: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <BookMarked className="w-5 h-5 text-amber-600" />
          <h1 className="text-xl sm:text-2xl font-bold text-navy-900 tracking-tight">
            Institutional Resource & Storage Oversight
          </h1>
        </div>
        <p className="text-xs text-brand-muted">
          Manage cloud storage quotas, uploaded PDF manuals, and dataset asset repositories
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        <Card className="border border-slate-200/80">
          <CardContent className="p-5 flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-primary flex items-center justify-center shrink-0">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-brand-muted font-medium">Storage Used</p>
              <h3 className="text-xl font-bold text-navy-900 mt-0.5">9.12 GB / 50 GB</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-slate-200/80">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-100/70 text-navy-900 uppercase text-[10px] font-bold border-b border-slate-200">
            <tr>
              <th className="p-3.5">Document Title</th>
              <th className="p-3.5">Category</th>
              <th className="p-3.5">File Size</th>
              <th className="p-3.5">Uploader</th>
              <th className="p-3.5">Downloads</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {MOCK_RESOURCES.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className="p-3.5 font-bold text-navy-900">{r.title}</td>
                <td className="p-3.5 capitalize font-medium">{r.category}</td>
                <td className="p-3.5 font-mono text-slate-600">{r.fileSize}</td>
                <td className="p-3.5 text-slate-800">{r.authorName}</td>
                <td className="p-3.5 font-bold text-teal-700">{r.downloadCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

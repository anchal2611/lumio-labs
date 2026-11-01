import React, { useState } from 'react';
import { BookMarked, Upload, Plus, Download, Trash2, FileText } from 'lucide-react';
import { MOCK_RESOURCES } from '../../services/mockData';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../contexts/ToastContext';

export const TeacherResources: React.FC = () => {
  const toast = useToast();

  const handleUpload = () => {
    toast.success('Upload Ready', 'Select PDF manual or SQLite database file to broadcast to students.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookMarked className="w-5 h-5 text-teal-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-navy-900 tracking-tight">
              Shared Teaching Repository
            </h1>
          </div>
          <p className="text-xs text-brand-muted">
            Upload and organize lab manuals, starter boilerplates, datasets, and circuit schematics
          </p>
        </div>

        <Button
          size="sm"
          variant="accent"
          leftIcon={<Upload className="w-3.5 h-3.5" />}
          onClick={handleUpload}
        >
          Upload Lab Resource
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MOCK_RESOURCES.map((r) => (
          <Card key={r.id} className="border border-slate-200/80">
            <CardContent className="p-5 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="aqua" size="sm" className="uppercase font-mono">
                    {r.fileType}
                  </Badge>
                  <span className="text-[11px] text-slate-400 font-mono">{r.fileSize}</span>
                </div>
                <h3 className="text-sm font-bold text-navy-900">{r.title}</h3>
                <p className="text-xs text-brand-muted mt-1 leading-relaxed">{r.description}</p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">{r.downloadCount} Student Downloads</span>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" className="text-xs">
                    Replace File
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

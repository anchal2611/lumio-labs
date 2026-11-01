import React, { useState } from 'react';
import { BookMarked, Download, Search, FileText, Database, Cpu, Code2 } from 'lucide-react';
import { MOCK_RESOURCES } from '../../services/mockData';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../contexts/ToastContext';

export const StudentResources: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const toast = useToast();

  const filtered = MOCK_RESOURCES.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCat === 'all' || r.category === selectedCat;
    return matchesSearch && matchesCat;
  });

  const handleDownload = (resource: any) => {
    toast.success('Download Initiated', `Downloading ${resource.title}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookMarked className="w-5 h-5 text-primary" />
            <h1 className="text-xl sm:text-2xl font-bold text-navy-900 tracking-tight">
              Laboratory Resource Library
            </h1>
          </div>
          <p className="text-xs text-brand-muted">
            Official university laboratory manuals, starter boilerplates, datasets, and circuit pinouts
          </p>
        </div>

        <div className="w-full sm:w-64">
          <Input
            placeholder="Search manuals & datasets..."
            leftIcon={<Search className="w-4 h-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((res) => (
          <Card key={res.id} className="border border-slate-200/80">
            <CardContent className="p-6 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="aqua" size="sm" className="uppercase font-mono">
                    {res.fileType}
                  </Badge>
                  <span className="text-[11px] text-slate-400 font-mono">{res.fileSize}</span>
                </div>

                <h3 className="text-sm font-bold text-navy-900 leading-snug">{res.title}</h3>
                <p className="text-xs text-brand-muted mt-1 leading-relaxed">{res.description}</p>

                <div className="flex items-center gap-1.5 flex-wrap mt-3">
                  {res.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  By {res.authorName} • {res.downloadCount} downloads
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  leftIcon={<Download className="w-3.5 h-3.5 text-primary" />}
                  onClick={() => handleDownload(res)}
                >
                  Download File
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

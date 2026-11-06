import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, FlaskConical, Sparkles, Code2, BookOpen } from 'lucide-react';
import { LabCard } from '../../components/labs/LabCard';
import { MOCK_LABS } from '../../services/mockData';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { apiGet } from '../../services/api';

interface RealLabItem {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  language: string;
  teacher_name?: string;
  exercises?: any[];
}

export const StudentLabsExplore: React.FC = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [classLabs, setClassLabs] = useState<RealLabItem[]>([]);

  useEffect(() => {
    apiGet<{ labs: RealLabItem[] }>('/labs')
      .then((res) => {
        if (res.labs && Array.isArray(res.labs)) {
          setClassLabs(res.labs);
        }
      })
      .catch(() => {});
  }, []);

  const categories = [
    { id: 'all', label: 'All Laboratories' },
    { id: 'programming', label: 'Programming' },
    { id: 'database', label: 'Database & SQL' },
    { id: 'iot', label: 'IoT & Electronics' },
    { id: 'web', label: 'Web Development' },
    { id: 'core_cs', label: 'Core CS & Systems' },
  ];

  const filteredMockLabs = MOCK_LABS.filter((lab) => {
    const matchesSearch =
      lab.name.toLowerCase().includes(search.toLowerCase()) ||
      lab.description.toLowerCase().includes(search.toLowerCase()) ||
      lab.tools.some((t) => t.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || lab.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const filteredClassLabs = classLabs.filter((lab) => {
    const matchesSearch =
      lab.title.toLowerCase().includes(search.toLowerCase()) ||
      (lab.description && lab.description.toLowerCase().includes(search.toLowerCase())) ||
      lab.language.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || lab.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FlaskConical className="w-5 h-5 text-primary" />
            <h1 className="text-xl sm:text-2xl font-bold text-navy-900 tracking-tight">
              Explore Laboratories
            </h1>
          </div>
          <p className="text-xs text-brand-muted">
            Launch interactive university workbenches, guided practicals, and assigned classroom lab modules
          </p>
        </div>

        {/* Search */}
        <div className="w-full md:w-72">
          <Input
            placeholder="Search labs, languages, tools..."
            leftIcon={<Search className="w-4 h-4" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-navy-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-brand-muted hover:text-navy-900 hover:bg-slate-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* 1. Assigned Classroom Labs Section (if any) */}
      {filteredClassLabs.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand-aqua" />
            <h2 className="text-base font-bold text-navy-900">Assigned Classroom Lab Modules</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClassLabs.map((lab) => (
              <Card
                key={lab.id}
                hoverable
                onClick={() => navigate(`/student/labs/${lab.id}`)}
                className="border border-primary/20 bg-primary/5 cursor-pointer flex flex-col justify-between"
              >
                <CardContent className="p-5 flex-col justify-between flex-1 flex">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <Badge variant="primary" size="sm" className="capitalize">
                        {lab.language}
                      </Badge>
                      <Badge variant="aqua" size="sm">
                        Course Practical
                      </Badge>
                    </div>
                    <h3 className="text-base font-bold text-navy-900">{lab.title}</h3>
                    <p className="text-xs text-brand-muted mt-1 line-clamp-2">{lab.description}</p>
                    <p className="text-[11px] text-slate-500 mt-2">
                      Faculty: <strong className="text-navy-900">{lab.teacher_name || 'Class Teacher'}</strong>
                    </p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-xs text-brand-muted font-medium">
                      {lab.exercises?.length || 0} Exercises
                    </span>
                    <Button size="sm" variant="primary">
                      Open Station →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* 2. University Interactive Workstations Section */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-navy-900">University Interactive Laboratories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMockLabs.map((lab) => (
            <LabCard key={lab.id} lab={lab} />
          ))}
        </div>
      </div>

      {filteredMockLabs.length === 0 && filteredClassLabs.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 p-8">
          <FlaskConical className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-navy-900">No matching laboratories found</h3>
          <p className="text-xs text-brand-muted mt-1">
            Try adjusting your search keywords or clearing category filters.
          </p>
        </div>
      )}
    </div>
  );
};

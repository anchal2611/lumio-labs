import React, { useState } from 'react';
import { Search, Filter, FlaskConical, Sparkles } from 'lucide-react';
import { LabCard } from '../../components/labs/LabCard';
import { MOCK_LABS } from '../../services/mockData';
import { LabCategory, LabDifficulty } from '../../types/lab';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';

export const StudentLabsExplore: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Laboratories' },
    { id: 'programming', label: 'Programming' },
    { id: 'database', label: 'Database & SQL' },
    { id: 'iot', label: 'IoT & Electronics' },
    { id: 'web', label: 'Web Development' },
    { id: 'core_cs', label: 'Core CS & Systems' },
  ];

  const filteredLabs = MOCK_LABS.filter((lab) => {
    const matchesSearch =
      lab.name.toLowerCase().includes(search.toLowerCase()) ||
      lab.description.toLowerCase().includes(search.toLowerCase()) ||
      lab.tools.some((t) => t.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || lab.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || lab.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
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
            Select a virtual lab to launch guided experiments or access blank workspaces
          </p>
        </div>

        {/* Search */}
        <div className="w-full md:w-72">
          <Input
            placeholder="Search labs, algorithms, tools..."
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

      {/* Labs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLabs.map((lab) => (
          <LabCard key={lab.id} lab={lab} />
        ))}
      </div>

      {filteredLabs.length === 0 && (
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

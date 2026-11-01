import React, { useState } from 'react';
import { useCollabStore } from '../../store/useCollabStore';
import { useAuth } from '../../contexts/AuthContext';
import { CollabEditorRoom } from '../../components/collaboration/CollabEditorRoom';
import { DoubtForum } from '../../components/collaboration/DoubtForum';
import {
  Users2,
  Plus,
  MessageSquare,
  Sparkles,
  HelpCircle,
  FileCode,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../contexts/ToastContext';

export const StudentCollaboration: React.FC = () => {
  const { rooms, activeRoom, setActiveRoom, createRoom } = useCollabStore();
  const { user } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'rooms' | 'doubts'>('rooms');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCategory, setNewCategory] = useState('programming');
  const [newLang, setNewLang] = useState<any>('cpp');

  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newTitle.trim()) return;

    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const created = createRoom({
      title: newTitle.trim(),
      description: newDesc.trim() || 'Collaborative coding study room.',
      roomCode: `LUMIO-${code}`,
      labCategory: newCategory,
      language: newLang,
      hostId: user.id,
      hostName: user.name,
      isPrivate: false,
      code: `// Collaborative Study Session: ${newTitle}\n// Host: ${user.name}\n\n#include <iostream>\n\nint main() {\n    std::cout << "Live multi-peer collaboration room online." << std::endl;\n    return 0;\n}\n`,
      tags: ['Study Group', 'C++'],
    });

    toast.success('Room Launched', `Created collaborative room LUMIO-${code}`);
    setShowCreateModal(false);
    setNewTitle('');
    setNewDesc('');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users2 className="w-5 h-5 text-teal-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-navy-900 tracking-tight">
              Collaboration Ecosystem
            </h1>
          </div>
          <p className="text-xs text-brand-muted">
            Code simultaneously in real-time rooms, join study groups, and resolve doubts with faculty
          </p>
        </div>

        {/* Tab Switcher: Peer Coding vs Doubt Forum */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('rooms')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'rooms'
                ? 'bg-white text-primary shadow-xs'
                : 'text-brand-muted hover:text-navy-900'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Collaborative Coding Rooms</span>
          </button>
          <button
            onClick={() => setActiveTab('doubts')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'doubts'
                ? 'bg-white text-teal-700 shadow-xs'
                : 'text-brand-muted hover:text-navy-900'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Ask a Teacher Forum</span>
          </button>
        </div>
      </div>

      {activeTab === 'rooms' ? (
        <div className="space-y-6">
          {/* Active Rooms Browser Bar */}
          <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-navy-900">Active Study Rooms:</span>
              <div className="flex items-center gap-1.5">
                {rooms.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setActiveRoom(r)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      activeRoom?.id === r.id
                        ? 'bg-primary text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {r.roomCode}
                  </button>
                ))}
              </div>
            </div>

            <Button
              size="sm"
              variant="accent"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
              onClick={() => setShowCreateModal(true)}
            >
              Create Study Room
            </Button>
          </div>

          {/* Active Collaborative Room Editor & Chat */}
          {activeRoom && <CollabEditorRoom room={activeRoom} />}
        </div>
      ) : (
        /* Doubt Resolution Forum */
        <DoubtForum />
      )}

      {/* Create Room Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Real-Time Collaborative Room"
        description="Launch an interactive shared Monaco editor session with live multi-cursor synchronization."
      >
        <form onSubmit={handleCreateRoom} className="space-y-4 text-xs">
          <Input
            label="Room Session Title"
            placeholder="e.g. Graph Traversal & Dijkstra Implementation"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-navy-900 mb-1">
              Programming Language
            </label>
            <select
              value={newLang}
              onChange={(e) => setNewLang(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-brand-text focus:outline-none focus:border-primary"
            >
              <option value="cpp">C++ (GCC 13)</option>
              <option value="python">Python 3.11</option>
              <option value="c">C (GCC 13)</option>
              <option value="java">Java 21</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy-900 mb-1">
              Session Objective / Notes
            </label>
            <textarea
              rows={3}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Pair programming goals..."
              className="w-full rounded-lg border border-slate-300 p-2 text-xs text-brand-text placeholder:text-slate-400 focus:outline-none focus:border-primary resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button size="sm" variant="outline" type="button" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="accent" type="submit">
              Launch Room
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

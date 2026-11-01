import React, { useState } from 'react';
import {
  HelpCircle,
  MessageCircle,
  CheckCircle,
  Award,
  Plus,
  Send,
  Code,
  Search,
  Filter,
} from 'lucide-react';
import { useCollabStore } from '../../store/useCollabStore';
import { useAuth } from '../../contexts/AuthContext';
import { DoubtThread } from '../../types/collaboration';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { useToast } from '../../contexts/ToastContext';

export const DoubtForum: React.FC = () => {
  const { doubts, activeDoubt, postDoubt, replyToDoubt, endorseReply, resolveDoubt } = useCollabStore();
  const { user, isTeacher } = useAuth();
  const [selectedThread, setSelectedThread] = useState<DoubtThread>(activeDoubt || doubts[0]);
  const [replyText, setReplyText] = useState('');
  const [showAskModal, setShowAskModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('C / C++ Systems Lab');
  const [newDesc, setNewDesc] = useState('');
  const [newCode, setNewCode] = useState('');

  const toast = useToast();

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !user || !selectedThread) return;

    replyToDoubt(selectedThread.id, {
      authorId: user.id,
      authorName: user.name,
      authorRole: user.role,
      authorAvatar: user.avatar,
      content: replyText.trim(),
      isEndorsedByTeacher: user.role === 'teacher',
    });

    setReplyText('');
    toast.success('Reply Posted', 'Your explanation has been added to the doubt thread.');
  };

  const handleCreateDoubt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim() || !user) return;

    postDoubt({
      title: newTitle.trim(),
      description: newDesc.trim(),
      codeSnippet: newCode.trim() || undefined,
      category: newCategory,
      studentId: user.id,
      studentName: user.name,
      studentDepartment: `${user.department || 'CSE'} Sem ${user.semester || 4}`,
      tags: ['Question', 'Lab Help'],
    });

    setShowAskModal(false);
    setNewTitle('');
    setNewDesc('');
    setNewCode('');
    toast.success('Question Posted', 'Your question has been broadcast to faculty and peer tutors.');
  };

  return (
    <div className="flex flex-col h-[780px] bg-white rounded-xl border border-slate-200/80 shadow-subtle overflow-hidden">
      {/* Forum Toolbar */}
      <div className="flex items-center justify-between p-4 bg-slate-50 border-b border-slate-200/80 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-teal-600" />
          <div>
            <h3 className="font-bold text-navy-900 text-sm">Ask a Teacher & Doubt Resolution</h3>
            <p className="text-[11px] text-brand-muted">
              Direct student-faculty academic Q&A with teacher-endorsed answers
            </p>
          </div>
        </div>

        <Button
          size="sm"
          variant="primary"
          leftIcon={<Plus className="w-3.5 h-3.5" />}
          onClick={() => setShowAskModal(true)}
        >
          Ask a Question
        </Button>
      </div>

      {/* Main Split: Left Threads List & Right Selected Thread Details */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Thread Cards */}
        <div className="w-80 bg-slate-50/70 border-r border-slate-200/80 flex flex-col shrink-0">
          <div className="p-2.5 border-b border-slate-200/80 bg-white">
            <span className="text-xs font-bold text-navy-900 uppercase tracking-wider">
              Recent Inquiries ({doubts.length})
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
            {doubts.map((thread) => {
              const isSelected = selectedThread?.id === thread.id;
              return (
                <div
                  key={thread.id}
                  onClick={() => setSelectedThread(thread)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'bg-white border-primary shadow-xs ring-1 ring-primary/20'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                      {thread.category}
                    </span>
                    {thread.isResolved ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                        <CheckCircle className="w-3 h-3" /> Resolved
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-600 font-semibold">Open</span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-navy-900 leading-snug line-clamp-2">
                    {thread.title}
                  </h4>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[10px] text-brand-muted">
                    <span>{thread.studentName}</span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" /> {thread.repliesCount} replies
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Thread View */}
        {selectedThread && (
          <div className="flex-1 flex flex-col min-w-0 bg-white">
            <div className="p-5 border-b border-slate-200/80 overflow-y-auto max-h-64">
              <div className="flex items-center justify-between gap-2 mb-2">
                <Badge variant="aqua" size="sm">
                  {selectedThread.category}
                </Badge>
                {isTeacher && !selectedThread.isResolved && (
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
                    onClick={() => {
                      resolveDoubt(selectedThread.id);
                      toast.success('Thread Resolved', 'Marked thread as resolved.');
                    }}
                  >
                    Mark as Resolved
                  </Button>
                )}
              </div>

              <h2 className="text-base font-bold text-navy-900 leading-tight">
                {selectedThread.title}
              </h2>
              <div className="flex items-center gap-2 mt-1 text-xs text-brand-muted">
                <span>Asked by <strong className="text-navy-900">{selectedThread.studentName}</strong></span>
                <span>•</span>
                <span>{selectedThread.studentDepartment}</span>
              </div>

              <p className="text-xs text-slate-700 mt-3 leading-relaxed">
                {selectedThread.description}
              </p>

              {selectedThread.codeSnippet && (
                <div className="mt-3">
                  <div className="text-[11px] font-mono text-slate-400 bg-navy-900 px-3 py-1 rounded-t-lg">
                    Code Reference:
                  </div>
                  <pre className="p-3 bg-navy-950 text-emerald-300 font-mono text-xs rounded-b-lg overflow-x-auto">
                    {selectedThread.codeSnippet}
                  </pre>
                </div>
              )}
            </div>

            {/* Replies List */}
            <div className="flex-1 p-5 overflow-y-auto space-y-3.5 bg-slate-50/50">
              <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider">
                Replies & Faculty Explanations ({selectedThread.replies.length})
              </h4>

              {selectedThread.replies.map((reply) => (
                <div
                  key={reply.id}
                  className={`p-4 rounded-xl border transition-all ${
                    reply.isEndorsedByTeacher
                      ? 'bg-blue-50/60 border-blue-200 shadow-2xs'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-navy-900">{reply.authorName}</span>
                      <Badge variant={reply.authorRole === 'teacher' ? 'aqua' : 'neutral'} size="sm">
                        {reply.authorRole}
                      </Badge>
                    </div>
                    {reply.isEndorsedByTeacher && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-teal-700 bg-teal-100/60 px-2 py-0.5 rounded-full">
                        <Award className="w-3.5 h-3.5 text-teal-600" /> Faculty Verified Solution
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">{reply.content}</p>
                </div>
              ))}
            </div>

            {/* Reply Input Form */}
            <form onSubmit={handleSendReply} className="p-4 bg-white border-t border-slate-200 flex gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={
                  isTeacher
                    ? 'Write an endorsed faculty explanation or guidance...'
                    : 'Add your contribution or clarification...'
                }
                className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3.5 py-2 text-xs text-brand-text placeholder:text-slate-400 focus:outline-none focus:border-primary"
              />
              <Button size="sm" variant="primary" type="submit" rightIcon={<Send className="w-3.5 h-3.5" />}>
                Post Reply
              </Button>
            </form>
          </div>
        )}
      </div>

      {/* Ask Question Modal */}
      <Modal
        isOpen={showAskModal}
        onClose={() => setShowAskModal(false)}
        title="Ask a Teacher / Post Academic Doubt"
        description="Share your practical challenge, error messages, or code snippet with faculty and peers."
      >
        <form onSubmit={handleCreateDoubt} className="space-y-4">
          <Input
            label="Question Title"
            placeholder="e.g. Why does my recursive BST height function overflow?"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-navy-900 mb-1.5">Lab Category</label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs text-brand-text focus:outline-none focus:border-primary"
            >
              <option value="Python Computing & Algorithms">Python Computing & Algorithms</option>
              <option value="C / C++ Systems Lab">C / C++ Systems Lab</option>
              <option value="Relational DBMS & SQL Lab">Relational DBMS & SQL Lab</option>
              <option value="IoT & Virtual Circuit Laboratory">IoT & Virtual Circuit Laboratory</option>
              <option value="Operating Systems & Networks">Operating Systems & Networks</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy-900 mb-1.5">
              Detailed Explanation / What have you tried?
            </label>
            <textarea
              rows={4}
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Describe what algorithm you are implementing and the unexpected behavior..."
              className="w-full rounded-lg border border-slate-300 bg-white p-3 text-xs text-brand-text placeholder:text-slate-400 focus:outline-none focus:border-primary resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-navy-900 mb-1.5">
              Code Snippet (Optional)
            </label>
            <textarea
              rows={4}
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              placeholder="// Paste relevant code here..."
              className="w-full rounded-lg border border-slate-300 bg-navy-950 p-3 text-xs font-mono text-emerald-300 placeholder:text-slate-600 focus:outline-none focus:border-primary resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <Button size="sm" variant="outline" type="button" onClick={() => setShowAskModal(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit">
              Broadcast Question
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

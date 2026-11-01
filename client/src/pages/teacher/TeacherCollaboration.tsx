import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import {
  Users2,
  BookOpen,
  MessageSquare,
  Sparkles,
  Save,
  Send,
  Share2,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardContent } from '../../components/ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

export const TeacherCollaboration: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [code, setCode] = useState(`/* 
 * LUMIO Faculty Practical Specification CS401
 * Co-Authors: Prof. Marcus Vance, Dr. Eleanor Brooks
 * Lab Module: CPU Scheduling Simulation (Round Robin)
 */
#include <stdio.h>

struct Process {
    int pid;
    int arrival_time;
    int burst_time;
    int remaining_time;
    int waiting_time;
    int turnaround_time;
};

// Standardized template for university student distribution
void simulate_round_robin(struct Process p[], int n, int quantum) {
    // 1. Maintain circular ready queue
    // 2. Track clock time increments
    // 3. Compute turnaround_time = finish_time - arrival_time
}
`);

  const [chatMessages, setChatMessages] = useState([
    {
      id: '1',
      sender: 'Dr. Eleanor Brooks',
      text: 'I updated the Round Robin quantum parameters to default to 2ms in the starter struct.',
      time: '11:15 AM',
    },
    {
      id: '2',
      sender: 'Prof. Marcus Vance',
      text: 'Looks great Eleanor! Let us also add the viva question regarding starvation vs convoy effect.',
      time: '11:20 AM',
    },
  ]);

  const [chatInput, setChatInput] = useState('');

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    setChatMessages((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        sender: user?.name || 'Prof. Marcus Vance',
        text: chatInput.trim(),
        time: 'Just now',
      },
    ]);

    setChatInput('');
  };

  const handleSaveDraft = () => {
    toast.success('Curriculum Saved', 'Updated CS401 laboratory manual revision in department repository.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users2 className="w-5 h-5 text-teal-600" />
            <h1 className="text-xl sm:text-2xl font-bold text-navy-900 tracking-tight">
              Faculty Co-Authoring & Curriculum Space
            </h1>
          </div>
          <p className="text-xs text-brand-muted">
            Collaboratively write laboratory manuals, standardize starter code, and coordinate practical exams
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="aqua" size="sm">
            Live Faculty Peer: Dr. Eleanor Brooks
          </Badge>
          <Button
            size="sm"
            variant="primary"
            leftIcon={<Save className="w-3.5 h-3.5" />}
            onClick={handleSaveDraft}
          >
            Publish to Syllabus
          </Button>
        </div>
      </div>

      {/* Editor & Faculty Lounge Split */}
      <div className="h-[750px] bg-white rounded-xl border border-slate-200/80 shadow-subtle flex overflow-hidden">
        {/* Left: Shared Monaco Editor */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-navy-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-teal-600" />
              <span>practical_manual_cs401_round_robin.c</span>
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              Auto-saved to Department Git
            </span>
          </div>

          <div className="flex-1 relative">
            <Editor
              height="100%"
              language="c"
              value={code}
              theme="vs-dark"
              onChange={(val) => setCode(val || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: "'JetBrains Mono', monospace",
                lineNumbers: 'on',
              }}
            />
          </div>
        </div>

        {/* Right: Faculty Discussion Lounge */}
        <div className="w-80 bg-slate-50 border-l border-slate-200/80 flex flex-col shrink-0">
          <div className="p-3 bg-white border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4 text-teal-600" />
              <span>Faculty Discussion Lounge</span>
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          </div>

          <div className="flex-1 p-3 overflow-y-auto space-y-3">
            {chatMessages.map((msg) => (
              <div key={msg.id} className="text-xs space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-navy-900">{msg.sender}</span>
                  <span className="text-[10px] text-slate-400">{msg.time}</span>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-slate-700 shadow-2xs leading-relaxed">
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendChat} className="p-3 bg-white border-t border-slate-200 flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Message co-authors..."
              className="flex-1 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-brand-text placeholder:text-slate-400 focus:outline-none focus:border-primary"
            />
            <Button size="sm" variant="accent" type="submit" rightIcon={<Send className="w-3.5 h-3.5" />}>
              Send
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

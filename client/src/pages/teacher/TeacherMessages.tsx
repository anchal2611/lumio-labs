import React, { useState } from 'react';
import { MessageSquare, Send, User, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';

export const TeacherMessages: React.FC = () => {
  const { user } = useAuth();
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'Alex Chen (Student)',
      isMe: false,
      text: 'Professor, thank you for the feedback on AVL trees! Should our Assignment 4 query analyze clustered indexes?',
      time: '10:18 AM',
    },
    {
      id: '2',
      sender: 'Prof. Marcus Vance',
      isMe: true,
      text: 'Yes Alex, compare the SQLite B-Tree page visits before and after indexing on student_id and semester.',
      time: '10:22 AM',
    },
  ]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        sender: user?.name || 'Prof. Marcus Vance',
        isMe: true,
        text: inputText.trim(),
        time: 'Just now',
      },
    ]);

    setInputText('');
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <MessageSquare className="w-5 h-5 text-teal-600" />
          <h1 className="text-xl sm:text-2xl font-bold text-navy-900 tracking-tight">
            Student Consultations & Inquiries
          </h1>
        </div>
        <p className="text-xs text-brand-muted">
          Direct messaging channel for student guidance, assignment inquiries, and viva scheduling
        </p>
      </div>

      <div className="h-[650px] bg-white rounded-xl border border-slate-200/80 shadow-subtle flex flex-col overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200/80 flex items-center gap-3">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"
            alt="Alex Chen"
            className="w-8 h-8 rounded-full object-cover"
          />
          <div>
            <h4 className="text-xs font-bold text-navy-900">Alex Chen (Roll: CS-2024-042)</h4>
            <p className="text-[10px] text-brand-muted">4th Semester CSE • Software Engineering</p>
          </div>
        </div>

        <div className="flex-1 p-5 overflow-y-auto space-y-3 bg-slate-50/30">
          {messages.map((m) => (
            <div key={m.id} className={`flex flex-col ${m.isMe ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                  m.isMe
                    ? 'bg-teal-700 text-white rounded-br-xs shadow-xs'
                    : 'bg-white text-navy-900 rounded-bl-xs border border-slate-200 shadow-2xs'
                }`}
              >
                <p>{m.text}</p>
              </div>
              <span className="text-[10px] text-slate-400 mt-1 px-1">{m.time}</span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your guidance to student..."
            className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-xs text-brand-text placeholder:text-slate-400 focus:outline-none focus:border-primary"
          />
          <Button size="sm" variant="accent" type="submit" rightIcon={<Send className="w-3.5 h-3.5" />}>
            Send Reply
          </Button>
        </form>
      </div>
    </div>
  );
};

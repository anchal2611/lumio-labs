import React, { useState } from 'react';
import { MessageSquare, Send, User, Sparkles, Search, CheckCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const StudentMessages: React.FC = () => {
  const { user } = useAuth();

  const [activeContactId, setActiveContactId] = useState('marcus');
  const [inputText, setInputText] = useState('');

  const [conversations, setConversations] = useState<Record<string, any[]>>({
    marcus: [
      {
        id: '1',
        sender: 'Prof. Marcus Vance',
        isMe: false,
        text: 'Hello Alex, I reviewed your AVL tree rotation logic for Practical 3. Very clean work.',
        time: '10:15 AM',
      },
      {
        id: '2',
        sender: 'Alex Chen',
        isMe: true,
        text: 'Thank you Professor! For Assignment 4, should our EXPLAIN QUERY PLAN analyze clustered index seeks specifically?',
        time: '10:18 AM',
      },
      {
        id: '3',
        sender: 'Prof. Marcus Vance',
        isMe: false,
        text: 'Yes, compare SQLite b-tree page visits before and after creating the index on student_id and semester.',
        time: '10:22 AM',
      },
    ],
    priya: [
      {
        id: '1',
        sender: 'Priya Sharma',
        isMe: false,
        text: 'Hey Alex! Are we meeting in the collaboration room at 4pm for the Dijkstra benchmark?',
        time: 'Yesterday',
      },
    ],
  });

  const contacts = [
    {
      id: 'marcus',
      name: 'Prof. Marcus Vance',
      role: 'Professor',
      unread: 0,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    },
    {
      id: 'priya',
      name: 'Priya Sharma',
      role: 'Student Peer',
      unread: 1,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    },
  ];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = {
      id: String(Date.now()),
      sender: user?.name || 'Alex Chen',
      isMe: true,
      text: inputText.trim(),
      time: 'Just now',
    };

    setConversations((prev) => ({
      ...prev,
      [activeContactId]: [...(prev[activeContactId] || []), newMsg],
    }));

    setInputText('');
  };

  const currentMessages = conversations[activeContactId] || [];
  const activeContact = contacts.find((c) => c.id === activeContactId);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <MessageSquare className="w-5 h-5 text-teal-600" />
          <h1 className="text-xl sm:text-2xl font-bold text-navy-900 tracking-tight">
            Direct Academic Messaging
          </h1>
        </div>
        <p className="text-xs text-brand-muted">
          Connect directly with faculty advisors, teaching assistants, and laboratory partners
        </p>
      </div>

      <div className="h-[680px] bg-white rounded-xl border border-slate-200/80 shadow-subtle flex overflow-hidden">
        {/* Left: Contact List */}
        <div className="w-72 bg-slate-50 border-r border-slate-200/80 flex flex-col shrink-0">
          <div className="p-3 border-b border-slate-200/80 bg-white">
            <span className="text-xs font-bold text-navy-900 uppercase tracking-wider">
              Conversations
            </span>
          </div>

          <div className="p-2 space-y-1 overflow-y-auto flex-1">
            {contacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => setActiveContactId(contact.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                  activeContactId === contact.id
                    ? 'bg-white shadow-2xs border border-slate-200 font-semibold'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                <img
                  src={contact.avatar}
                  alt={contact.name}
                  className="w-9 h-9 rounded-full object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-navy-900 truncate">{contact.name}</h4>
                    {contact.unread > 0 && (
                      <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-brand-muted truncate">{contact.role}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right: Message Stream */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          {/* Active Contact Header */}
          <div className="p-4 bg-slate-50 border-b border-slate-200/80 flex items-center gap-3">
            <img
              src={activeContact?.avatar}
              alt={activeContact?.name}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div>
              <h3 className="text-xs font-bold text-navy-900">{activeContact?.name}</h3>
              <p className="text-[10px] text-brand-muted">{activeContact?.role}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-5 overflow-y-auto space-y-3 bg-slate-50/30">
            {currentMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-md p-3.5 rounded-2xl text-xs leading-relaxed ${
                    msg.isMe
                      ? 'bg-primary text-white rounded-br-xs shadow-xs'
                      : 'bg-white text-navy-900 rounded-bl-xs border border-slate-200 shadow-2xs'
                  }`}
                >
                  <p>{msg.text}</p>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 px-1">{msg.time}</span>
              </div>
            ))}
          </div>

          {/* Composer */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your message to professor..."
              className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-xs text-brand-text placeholder:text-slate-400 focus:outline-none focus:border-primary"
            />
            <Button size="sm" variant="primary" type="submit" rightIcon={<Send className="w-3.5 h-3.5" />}>
              Send
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

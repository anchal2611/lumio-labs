import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import {
  Users,
  Send,
  MessageSquare,
  Sparkles,
  Share2,
  Lock,
  Globe,
  Play,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { CollabRoom, ChatMessage } from '../../types/collaboration';
import { useAuth } from '../../contexts/AuthContext';
import { useCollabStore } from '../../store/useCollabStore';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { executeCode } from '../../services/execution';
import { useToast } from '../../contexts/ToastContext';

interface CollabEditorRoomProps {
  room: CollabRoom;
}

export const CollabEditorRoom: React.FC<CollabEditorRoomProps> = ({ room }) => {
  const { user } = useAuth();
  const { messages, sendMessage, updateRoomCode } = useCollabStore();
  const [chatInput, setChatInput] = useState('');
  const [stdout, setStdout] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  const toast = useToast();
  const roomMessages = messages[room.id] || [];

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !user) return;

    sendMessage(room.id, {
      senderId: user.id,
      senderName: user.name,
      senderRole: user.role,
      senderAvatar: user.avatar,
      content: chatInput.trim(),
    });

    setChatInput('');
  };

  const handleCodeChange = (newVal: string | undefined) => {
    updateRoomCode(room.id, newVal || '');
  };

  const handleRun = async () => {
    setIsExecuting(true);
    try {
      const res = await executeCode(room.language, room.code);
      setStdout(res.stdout || res.stderr);
      toast.success('Collaborative Execution', `Completed in ${res.timeMs}ms`);
    } catch {
      toast.error('Execution Error');
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="flex flex-col h-[780px] bg-white rounded-xl border border-slate-200/80 shadow-subtle overflow-hidden">
      {/* Room Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-slate-50 border-b border-slate-200/80 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-navy-900 text-sm">{room.title}</h3>
            <Badge variant="aqua" size="sm" className="font-mono">
              Room {room.roomCode}
            </Badge>
          </div>
          <span className="text-xs text-brand-muted hidden sm:inline">
            Host: {room.hostName}
          </span>
        </div>

        {/* Active Participants Avatars */}
        <div className="flex items-center gap-4">
          <div className="flex items-center -space-x-2">
            {room.participants.map((p) => (
              <div
                key={p.id}
                className="relative group cursor-pointer"
                title={`${p.name} (${p.role})`}
              >
                <div
                  className="w-7 h-7 rounded-full text-white flex items-center justify-center text-xs font-bold ring-2 ring-white shadow-xs"
                  style={{ backgroundColor: p.color }}
                >
                  {p.name.charAt(0)}
                </div>
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white" />
              </div>
            ))}
          </div>

          <Button
            size="sm"
            variant="primary"
            isLoading={isExecuting}
            leftIcon={<Play className="w-3.5 h-3.5 fill-white" />}
            onClick={handleRun}
          >
            Run Code
          </Button>
        </div>
      </div>

      {/* Editor & Chat Split */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 relative">
            <Editor
              height="100%"
              language={room.language === 'cpp' ? 'cpp' : 'python'}
              value={room.code}
              theme="vs-dark"
              onChange={handleCodeChange}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: "'JetBrains Mono', monospace",
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                wordWrap: 'on',
              }}
            />
          </div>

          {/* Shared Output Strip */}
          {stdout && (
            <div className="h-36 bg-navy-950 border-t border-navy-800 p-3 overflow-y-auto text-xs font-mono">
              <div className="text-[10px] text-brand-aqua uppercase tracking-wider font-bold mb-1 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Shared Execution Output (Visible to all participants)</span>
              </div>
              <pre className="text-emerald-300 whitespace-pre-wrap">{stdout}</pre>
            </div>
          )}
        </div>

        {/* Live In-Room Chat Sidebar */}
        <div className="w-80 bg-slate-50 border-l border-slate-200/80 flex flex-col shrink-0">
          <div className="p-3 bg-white border-b border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-teal-600" />
              <h4 className="text-xs font-bold text-navy-900">Room Live Chat</h4>
            </div>
            <span className="text-[10px] text-slate-400">
              {room.participants.length} Active
            </span>
          </div>

          {/* Messages list */}
          <div className="flex-1 p-3 overflow-y-auto space-y-2.5">
            {roomMessages.map((msg) => (
              <div key={msg.id} className="text-xs">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="font-bold text-navy-900">{msg.senderName}</span>
                  <Badge variant={msg.senderRole === 'teacher' ? 'aqua' : 'neutral'} size="sm" className="text-[9px] px-1.5 py-0">
                    {msg.senderRole}
                  </Badge>
                  <span className="text-[10px] text-slate-400">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-slate-700 shadow-2xs leading-relaxed">
                  {msg.content}
                </div>
              </div>
            ))}
          </div>

          {/* Chat Composer */}
          <form onSubmit={handleSendChat} className="p-2 bg-white border-t border-slate-200/80 flex items-center gap-1.5">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Send a message to room..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-brand-text placeholder:text-slate-400 focus:outline-none focus:border-primary"
            />
            <Button size="sm" variant="primary" type="submit" className="p-2">
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

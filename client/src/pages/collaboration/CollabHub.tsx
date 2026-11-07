import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import MonacoEditor from '@monaco-editor/react';
import { Users, MessageSquare, Play, Plus, X, Send, Loader2, Zap, FlaskConical, GraduationCap, BookOpen, Wifi, WifiOff, Square } from 'lucide-react';
import { apiDelete, apiGet, apiPost, getAuthToken } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { config } from '../../config/env';
import { useToast } from '../../contexts/ToastContext';

const LANGS = ['python', 'javascript', 'cpp', 'java', 'sql'];

interface Session { id: string; name: string; type: string; host_id: string; host_name: string; host_role: string; language: string; initial_code: string; }
interface Participant { userId?: string; userName: string; userRole?: string; socketId?: string; }
interface ChatMessage { id: string; senderName: string; text: string; timestamp: string; }

const TAB_INFO = [
  { key: 'peer', label: 'Peer Sessions', icon: GraduationCap, desc: 'Code together with classmates' },
  { key: 'faculty', label: 'Faculty Help', icon: BookOpen, desc: 'Get live help from your teacher' },
  { key: 'class', label: 'Class Broadcast', icon: Zap, desc: 'Live sessions from your teacher' },
];

export const CollabHub: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('peer');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', language: 'python' });

  // Socket state
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [code, setCode] = useState('');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const [ending, setEnding] = useState(false);
  const [sendingChat, setSendingChat] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await apiGet<{ sessions: Session[] }>(`/collab/sessions?type=${activeTab}`);
      setSessions(res.sessions);
    } catch { } finally { setLoading(false); }
  }, [activeTab]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chat]);
  useEffect(() => () => { socketRef.current?.disconnect(); }, []);

  const addChatMessage = (message: ChatMessage) => {
    setChat((current) => current.some((item) => item.id === message.id) ? current : [...current, message]);
  };

  const disconnectSession = () => {
    socketRef.current?.disconnect();
    socketRef.current = null;
    setActiveSession(null); setConnected(false); setParticipants([]); setChat([]); setChatInput('');
  };

  const connectToSession = async (session: Session) => {
    socketRef.current?.disconnect();
    setActiveSession(session);
    setCode(session.initial_code || '');
    setParticipants([]); setChat([]); setChatInput(''); setOutput(''); setConnected(false);
    const token = await getAuthToken();
    if (!token) { setOutput('Sign in again to join this session.'); return; }
    const socket = io(config.socketUrl, { auth: { token }, transports: ['websocket', 'polling'] });
    socketRef.current = socket;
    socket.on('connect', () => {
      setConnected(false);
      socket.emit('join_room', { roomId: session.id }, (result: { ok: boolean; error?: string }) => {
        if (result?.ok) setConnected(true);
        else { setConnected(false); setOutput(result?.error || 'Could not join this session.'); }
      });
    });
    socket.on('disconnect', () => setConnected(false));
    socket.on('connect_error', (err) => { setConnected(false); setOutput(err.message || 'Could not connect to this session.'); });
    socket.on('room_error', ({ error }: { error: string }) => { setOutput(error || 'Could not join this session.'); setConnected(false); });
    socket.on('code_updated', ({ code: c }: any) => setCode(c));
    socket.on('room_participants_updated', (p: Participant[]) => setParticipants(p));
    socket.on('chat_received', (msg: ChatMessage) => addChatMessage(msg));
    socket.on('output_shared', ({ output: o, senderName }: any) => { setOutput(o); addChatMessage({ id: `output-${Date.now()}`, senderName, text: `Shared output: ${String(o).slice(0, 80)}`, timestamp: new Date().toISOString() }); });
    socket.on('session_ended', () => {
      setOutput('The host ended this session.');
      disconnectSession();
      toast.info('Session ended', 'The host has closed this collaboration session.');
      void fetchSessions();
    });
  };

  const endSession = async () => {
    if (!activeSession || activeSession.host_id !== user?.id) return;
    setEnding(true);
    try {
      await apiDelete(`/collab/sessions/${activeSession.id}`);
      disconnectSession();
      await fetchSessions();
    } catch (err) {
      setOutput(err instanceof Error ? `Could not end session: ${err.message}` : 'Could not end session.');
    } finally {
      setEnding(false);
    }
  };

  const handleCodeChange = (val: string | undefined) => {
    const c = val || '';
    setCode(c);
    socketRef.current?.emit('code_change', { roomId: activeSession?.id, code: c });
  };

  const sendChat = () => {
    const messageText = chatInput.trim();
    const socket = socketRef.current;
    if (!messageText || !activeSession || sendingChat) return;
    if (!connected || !socket?.connected) { toast.error('Not connected', 'Wait for the live session to reconnect before sending.'); return; }
    const msg: ChatMessage = { id: window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`, senderName: user?.name || 'You', text: messageText, timestamp: new Date().toISOString() };
    setSendingChat(true);
    socket.timeout(5000).emit('send_chat', { roomId: activeSession.id, message: msg }, (err: Error | null, result: { ok: boolean; error?: string; message?: ChatMessage }) => {
      setSendingChat(false);
      if (err || !result?.ok || !result.message) { toast.error('Message not sent', result?.error || 'Check your connection and try again.'); return; }
      addChatMessage(result.message);
      setChatInput((current) => current === messageText ? '' : current);
    });
  };

  const runCode = async () => {
    if (!code.trim()) return;
    setRunning(true);
    try {
      const data = await apiPost<{ stdout?: string; stderr?: string; exitCode?: number; timeMs?: number; provider?: string }>('/execute', { language: activeSession?.language || 'python', code });
      const sections = [data.stdout?.trimEnd(), data.stderr?.trimEnd()].filter(Boolean);
      if (!sections.length) sections.push(`Program finished without output (exit code ${data.exitCode ?? 0}).`);
      if (data.provider) sections.push(`Provider: ${data.provider}${data.timeMs !== undefined ? ` · ${data.timeMs} ms` : ''}`);
      const out = sections.join('\n\n');
      setOutput(out);
      socketRef.current?.emit('share_output', { roomId: activeSession?.id, output: out });
    } catch (err) { setOutput(err instanceof Error ? err.message : 'Execution failed.'); }
    finally { setRunning(false); }
  };

  const createSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await apiPost('/collab/sessions', { name: createForm.name, type: activeTab, language: createForm.language });
      setShowCreateModal(false);
      setCreateForm({ name: '', language: 'python' });
      await fetchSessions();
      toast.success('Session created', 'Your session is now available to participants.');
    } catch (err) { toast.error('Could not create session', err instanceof Error ? err.message : 'Please try again.'); } finally { setCreating(false); }
  };

  const monacoLang = (l: string) => l === 'cpp' ? 'cpp' : l;

  if (activeSession) {
    return (
      <div className="h-full flex flex-col bg-slate-950">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <button onClick={disconnectSession} title="Leave session" className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              <X className="w-4 h-4" />
            </button>
            <span className="text-white font-semibold">{activeSession.name}</span>
            <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${ connected ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400' }`}>
              {connected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              {connected ? 'Live' : 'Connecting...'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {participants.slice(0, 5).map((p, i) => (
                <div key={p.socketId || p.userId || i} className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 border-2 border-slate-900 flex items-center justify-center text-xs text-white font-bold" title={p.userName}>
                  {p.userName?.[0]?.toUpperCase()}
                </div>
              ))}
            </div>
            <span className="text-slate-500 text-sm">{participants.length} online</span>
            <button onClick={runCode} disabled={running} className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-900 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
              {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />} Run
            </button>
            {activeSession.host_id === user?.id && (
              <button onClick={endSession} disabled={ending} className="flex items-center gap-1.5 bg-red-700 hover:bg-red-600 disabled:opacity-60 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
                {ending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Square className="w-3.5 h-3.5 fill-current" />}
                {ending ? 'Ending…' : 'End session'}
              </button>
            )}
            <button onClick={() => setShowChat(!showChat)} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              <MessageSquare className="w-4 h-4" />
            </button>
          </div>
        </div>
        {/* Main area */}
        <div className="flex-1 flex overflow-hidden">
          <div className="flex-1 flex flex-col">
            <div className="flex-1">
              <MonacoEditor
                height="100%"
                language={monacoLang(activeSession.language)}
                value={code}
                onChange={handleCodeChange}
                theme="vs-dark"
                options={{ fontSize: 14, minimap: { enabled: false }, automaticLayout: true, wordWrap: 'on' }}
              />
            </div>
            {output && (
              <div className="h-32 bg-slate-950 border-t border-slate-800 p-3 overflow-auto">
                <p className="text-xs text-slate-500 mb-1 font-mono">▶ Output</p>
                <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap">{output}</pre>
              </div>
            )}
          </div>
          {/* Chat panel */}
          {showChat && (
            <div className="w-72 bg-slate-900 border-l border-slate-800 flex flex-col">
              <div className="p-3 border-b border-slate-800">
                <p className="text-sm font-semibold text-white">Live Chat</p>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {chat.map(m => (
                  <div key={m.id}>
                    <p className="text-xs text-slate-500">{m.senderName}</p>
                    <p className="text-sm text-slate-200 bg-slate-800/50 rounded-lg px-3 py-2">{m.text}</p>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <div className="p-3 border-t border-slate-800 flex gap-2">
                <input value={chatInput} disabled={!connected || sendingChat} onChange={e => setChatInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); sendChat(); } }} className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-60" placeholder={connected ? 'Type message...' : 'Connecting…'} />
                <button type="button" onClick={sendChat} disabled={!connected || sendingChat || !chatInput.trim()} aria-label="Send message" className="p-2 bg-blue-600 hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50 text-white rounded-lg transition-colors"><Send className="w-4 h-4" /></button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Collaboration Hub</h1>
          <p className="text-slate-400 mt-1">Real-time coding sessions with peers and faculty</p>
        </div>
        {(activeTab === 'peer' || (activeTab !== 'class' && user?.role === 'teacher')) && (
          <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/20">
            <Plus className="w-5 h-5" /> New Session
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-900 p-1 rounded-xl mb-6 w-fit">
        {TAB_INFO.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${ activeTab === tab.key ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white' }`}>
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40"><Loader2 className="w-8 h-8 text-blue-400 animate-spin" /></div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-20">
          <Users className="w-14 h-14 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No active sessions</h3>
          <p className="text-slate-500 mb-6">{TAB_INFO.find(t => t.key === activeTab)?.desc}</p>
          {activeTab === 'peer' && (
            <button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-medium transition-all">Start a Session</button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.map(s => (
            <div key={s.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-600 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-white font-semibold">{s.name}</h3>
                  <p className="text-slate-500 text-sm mt-0.5">by {s.host_name}</p>
                </div>
                <span className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs rounded-full">Live</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-500 mb-4">
                <span className="bg-slate-800 px-2.5 py-1 rounded-lg font-mono">{s.language}</span>
              </div>
              <button onClick={() => connectToSession(s)} className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-all text-sm">Join Session</button>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowCreateModal(false)}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">New Collab Session</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={createSession} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Session Name</label>
                <input value={createForm.name} onChange={e => setCreateForm(f => ({...f, name: e.target.value}))} required className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all" placeholder="Algo practice session" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">Language</label>
                <select value={createForm.language} onChange={e => setCreateForm(f => ({...f, language: e.target.value}))} className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all">
                  {LANGS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all">Cancel</button>
                <button type="submit" disabled={creating} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-semibold py-3 rounded-xl transition-all">
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  {creating ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CollabHub;

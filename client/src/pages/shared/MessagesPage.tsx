import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, Loader2, MessageSquare, Search, Send } from 'lucide-react';
import { apiGet, apiPost } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';

type Contact = { id: string; name: string; email: string; role: string; avatar?: string | null };
type Conversation = { id: string; other_user_id: string; other_name: string; other_email: string; other_role: string; other_avatar?: string | null; last_message?: string; last_message_at?: string; unread_count: number };
type Message = { id: string; sender_id: string; sender_name: string; body: string; created_at: string };

export const MessagesPage: React.FC = () => {
  const { user, role } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeId, setActiveId] = useState('');
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const loadInbox = useCallback(async () => {
    try {
      const [contactData, conversationData] = await Promise.all([
        apiGet<{ contacts: Contact[] }>('/messages/contacts'),
        apiGet<{ conversations: Conversation[] }>('/messages/conversations'),
      ]);
      setContacts(contactData.contacts || []);
      setConversations(conversationData.conversations || []);
      setActiveId((current) => current || conversationData.conversations?.[0]?.other_user_id || '');
      setError('');
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not load messages.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void loadInbox(); const timer = window.setInterval(() => void loadInbox(), 12000); return () => window.clearInterval(timer); }, [loadInbox]);
  const activeContact = contacts.find((contact) => contact.id === activeId) || (() => {
    const item = conversations.find((conversation) => conversation.other_user_id === activeId);
    return item ? { id: item.other_user_id, name: item.other_name, email: item.other_email, role: item.other_role, avatar: item.other_avatar } : undefined;
  })();
  const activeConversation = conversations.find((conversation) => conversation.other_user_id === activeId);

  const loadMessages = useCallback(async (conversationId: string) => {
    setMessagesLoading(true);
    try {
      const data = await apiGet<{ messages: Message[] }>(`/messages/conversations/${encodeURIComponent(conversationId)}`);
      setMessages(data.messages || []);
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not load this conversation.'); }
    finally { setMessagesLoading(false); }
  }, []);

  useEffect(() => {
    if (!activeConversation?.id) { setMessages([]); return; }
    void loadMessages(activeConversation.id);
    const timer = window.setInterval(() => void loadMessages(activeConversation.id), 6000);
    return () => window.clearInterval(timer);
  }, [activeConversation?.id, loadMessages]);

  const visibleContacts = useMemo(() => {
    const query = search.trim().toLowerCase();
    const seen = new Set<string>();
    return [...conversations.map((conversation) => ({ id: conversation.other_user_id, name: conversation.other_name, email: conversation.other_email, role: conversation.other_role, avatar: conversation.other_avatar })), ...contacts]
      .filter((contact) => {
        if (seen.has(contact.id)) return false;
        seen.add(contact.id);
        return !query || `${contact.name} ${contact.email} ${contact.role}`.toLowerCase().includes(query);
      });
  }, [contacts, conversations, search]);

  const send = async (event: React.FormEvent) => {
    event.preventDefault();
    const body = input.trim();
    if (!body || !activeId || sending) return;
    setSending(true); setError('');
    try {
      const clientMessageId = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const result = await apiPost<{ conversationId: string }>('/messages', { recipientId: activeId, body, clientMessageId });
      setInput('');
      await loadInbox();
      await loadMessages(result.conversationId);
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not send this message.'); }
    finally { setSending(false); }
  };

  const title = role === 'admin' ? 'Institute messages' : role === 'teacher' ? 'Messages' : 'Messages';
  return <div className="space-y-5">
    <header><div className="mb-1 flex items-center gap-2"><MessageSquare className="h-5 w-5 text-teal-600" /><h1 className="text-xl font-bold text-navy-900 sm:text-2xl">{title}</h1></div><p className="text-sm text-brand-muted">Message people connected to your institute or classes. New messages and replies appear here across roles.</p></header>
    {error && <div role="alert" className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
    <Card className="flex h-[min(720px,calc(100vh-220px))] min-h-[440px] overflow-hidden">
      <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-slate-50 sm:w-72">
        <div className="border-b border-slate-200 bg-white p-3"><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-navy-900">People & conversations</p><div className="relative"><Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search people" className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs outline-none focus:border-primary" /></div></div>
        <div className="flex-1 space-y-1 overflow-y-auto p-2">
          {loading ? <div className="p-5 text-center text-xs text-brand-muted"><Loader2 className="mr-1 inline h-4 w-4 animate-spin" />Loading…</div>
            : visibleContacts.length === 0 ? <p className="p-4 text-xs leading-relaxed text-brand-muted">No contacts are available yet. Join or create a class to connect with its people.</p>
            : visibleContacts.map((contact) => {
              const conversation = conversations.find((item) => item.other_user_id === contact.id);
              return <button key={contact.id} onClick={() => setActiveId(contact.id)} className={`w-full rounded-xl p-3 text-left transition-colors ${activeId === contact.id ? 'border border-slate-200 bg-white shadow-sm' : 'hover:bg-white/80'}`}>
                <div className="flex items-center gap-2.5"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{contact.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}</div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><p className="truncate text-xs font-semibold text-navy-900">{contact.name}</p>{conversation?.unread_count ? <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white">{conversation.unread_count}</span> : null}</div><p className="truncate text-[11px] capitalize text-brand-muted">{contact.role}</p><p className="truncate text-[11px] text-slate-400">{conversation?.last_message || contact.email}</p></div></div>
              </button>;
            })}
        </div>
      </aside>
      <section className="flex min-w-0 flex-1 flex-col bg-white">
        {activeContact ? <>
          <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{activeContact.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}</div><div><p className="text-sm font-semibold text-navy-900">{activeContact.name}</p><p className="text-xs capitalize text-brand-muted">{activeContact.role} · {activeContact.email}</p></div></div>
          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/30 p-4 sm:p-5">
            {messagesLoading && messages.length === 0 ? <p className="text-center text-xs text-brand-muted"><Loader2 className="mr-1 inline h-4 w-4 animate-spin" />Loading conversation…</p>
              : messages.length ? messages.map((message) => { const mine = message.sender_id === user?.id; return <div key={message.id} className={`flex flex-col ${mine ? 'items-end' : 'items-start'}`}><div className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${mine ? 'rounded-br-sm bg-primary text-white' : 'rounded-bl-sm border border-slate-200 bg-white text-navy-900'}`}>{message.body}</div><span className="mt-1 px-1 text-[10px] text-slate-400">{new Date(message.created_at + (message.created_at.includes('Z') ? '' : 'Z')).toLocaleString()}</span></div>; })
              : <div className="flex h-full items-center justify-center text-center"><div><MessageSquare className="mx-auto mb-2 h-8 w-8 text-slate-300" /><p className="text-sm font-medium text-navy-900">Start the conversation</p><p className="mt-1 text-xs text-brand-muted">Your messages will be stored and shared with {activeContact.name}.</p></div></div>}
          </div>
          <form onSubmit={send} className="flex gap-2 border-t border-slate-200 bg-white p-3"><textarea rows={1} maxLength={4000} value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); event.currentTarget.form?.requestSubmit(); } }} placeholder={`Message ${activeContact.name}…`} className="max-h-32 min-w-0 flex-1 resize-y rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" /><Button size="sm" type="submit" disabled={!input.trim() || sending} isLoading={sending} aria-label="Send message" rightIcon={<Send className="h-3.5 w-3.5" />}>Send</Button></form>
        </> : <div className="flex flex-1 items-center justify-center p-6 text-center"><div><MessageSquare className="mx-auto mb-3 h-9 w-9 text-slate-300" /><h2 className="text-sm font-semibold text-navy-900">No conversation selected</h2><p className="mt-1 text-xs text-brand-muted">Choose someone from your institute or class to start a message.</p></div></div>}
      </section>
    </Card>
  </div>;
};

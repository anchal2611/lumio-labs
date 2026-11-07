import { Response } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db/database';
import { AuthRequest } from '../middleware/auth';
import { createNotification } from './activityController';

function effectiveInstituteId(req: AuthRequest): string | null {
  if (req.user?.instituteId) return req.user.instituteId;
  const row = req.user?.role === 'teacher'
    ? db.prepare('SELECT id, institute_id FROM classes WHERE teacher_id = ? ORDER BY created_at LIMIT 1').get(req.user.userId) as any
    : db.prepare(`SELECT c.id, c.institute_id FROM classes c JOIN class_enrollments ce ON ce.class_id = c.id
      WHERE ce.student_id = ? ORDER BY ce.enrolled_at LIMIT 1`).get(req.user!.userId) as any;
  return row?.institute_id || (row?.id ? `class:${row.id}` : null);
}

function contactRows(req: AuthRequest): any[] {
  const user = req.user!;
  const instituteId = effectiveInstituteId(req);
  if (!instituteId) return [];
  if (user.role === 'admin') {
    return db.prepare(`SELECT id, name, email, role, avatar FROM users WHERE institute_id = ? AND id <> ? AND status = 'active' ORDER BY role, name`)
      .all(instituteId, user.userId);
  }
  if (user.role === 'teacher') {
    return db.prepare(`SELECT DISTINCT u.id, u.name, u.email, u.role, u.avatar FROM users u WHERE u.status = 'active' AND u.id <> ? AND (
      (u.role = 'admin' AND u.institute_id = ?) OR
      (u.role = 'student' AND EXISTS (SELECT 1 FROM class_enrollments ce JOIN classes c ON c.id = ce.class_id WHERE ce.student_id = u.id AND c.teacher_id = ?))
    ) ORDER BY u.role, u.name`).all(user.userId, instituteId, user.userId);
  }
  return db.prepare(`SELECT DISTINCT u.id, u.name, u.email, u.role, u.avatar FROM users u WHERE u.status = 'active' AND u.id <> ? AND (
      (u.role = 'admin' AND u.institute_id = ?) OR
      (u.role = 'teacher' AND EXISTS (SELECT 1 FROM class_enrollments ce JOIN classes c ON c.id = ce.class_id WHERE ce.student_id = ? AND c.teacher_id = u.id)) OR
      (u.role = 'student' AND EXISTS (SELECT 1 FROM class_enrollments mine JOIN class_enrollments peer ON peer.class_id = mine.class_id WHERE mine.student_id = ? AND peer.student_id = u.id))
    ) ORDER BY u.role, u.name`).all(user.userId, instituteId, user.userId, user.userId);
}

export function listMessageContacts(req: AuthRequest, res: Response): void {
  res.json({ contacts: contactRows(req) });
}

export function listConversations(req: AuthRequest, res: Response): void {
  const userId = req.user!.userId;
  const conversations = db.prepare(`SELECT c.id, c.updated_at, other.id AS other_user_id, other.name AS other_name, other.email AS other_email,
      other.role AS other_role, other.avatar AS other_avatar, latest.body AS last_message, latest.created_at AS last_message_at,
      (SELECT COUNT(*) FROM messages unread JOIN conversation_members mine ON mine.conversation_id = unread.conversation_id AND mine.user_id = ?
       WHERE unread.conversation_id = c.id AND unread.sender_id <> ? AND (mine.last_read_at IS NULL OR unread.created_at > mine.last_read_at)) AS unread_count
    FROM conversations c
    JOIN conversation_members mine ON mine.conversation_id = c.id AND mine.user_id = ?
    JOIN conversation_members theirs ON theirs.conversation_id = c.id AND theirs.user_id <> ?
    JOIN users other ON other.id = theirs.user_id
    LEFT JOIN messages latest ON latest.id = (SELECT m.id FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC, m.rowid DESC LIMIT 1)
    ORDER BY COALESCE(latest.created_at, c.updated_at) DESC`).all(userId, userId, userId, userId);
  res.json({ conversations });
}

export function getConversationMessages(req: AuthRequest, res: Response): void {
  const userId = req.user!.userId;
  const conversation = db.prepare(`SELECT id FROM conversations WHERE id = ? AND EXISTS (
    SELECT 1 FROM conversation_members WHERE conversation_id = ? AND user_id = ?)`)
    .get(req.params.id, req.params.id, userId);
  if (!conversation) {
    res.status(404).json({ error: 'Conversation not found.' });
    return;
  }
  const messages = db.prepare(`SELECT m.id, m.sender_id, u.name AS sender_name, m.body, m.created_at
    FROM messages m JOIN users u ON u.id = m.sender_id WHERE m.conversation_id = ? ORDER BY m.created_at ASC, m.rowid ASC LIMIT 500`)
    .all(req.params.id);
  db.prepare("UPDATE conversation_members SET last_read_at = datetime('now') WHERE conversation_id = ? AND user_id = ?")
    .run(req.params.id, userId);
  res.json({ messages });
}

export function sendMessage(req: AuthRequest, res: Response): void {
  const body = typeof req.body?.body === 'string' ? req.body.body.trim() : '';
  const recipientId = typeof req.body?.recipientId === 'string' ? req.body.recipientId : '';
  const clientMessageId = typeof req.body?.clientMessageId === 'string' ? req.body.clientMessageId.slice(0, 100) : null;
  if (!body || body.length > 4000) {
    res.status(400).json({ error: 'Message must contain 1 to 4000 characters.' });
    return;
  }
  if (!recipientId || recipientId === req.user!.userId) {
    res.status(400).json({ error: 'Choose another account to message.' });
    return;
  }
  const peer = contactRows(req).find((contact) => contact.id === recipientId);
  if (!peer) {
    res.status(403).json({ error: 'You can only message people connected to your institute or classes.' });
    return;
  }
  const instituteId = effectiveInstituteId(req);
  if (!instituteId) {
    res.status(403).json({ error: 'Your account must be linked to an institute or class before messaging.' });
    return;
  }
  const senderId = req.user!.userId;
  if (clientMessageId) {
    const duplicate = db.prepare('SELECT id, conversation_id, body, created_at FROM messages WHERE sender_id = ? AND client_message_id = ?').get(senderId, clientMessageId) as any;
    if (duplicate) {
      res.json({ message: { ...duplicate, sender_id: senderId }, conversationId: duplicate.conversation_id, duplicate: true });
      return;
    }
  }
  const [memberA, memberB] = [senderId, recipientId].sort();
  let conversation = db.prepare('SELECT id FROM conversations WHERE member_a = ? AND member_b = ?').get(memberA, memberB) as any;
  if (!conversation) {
    const id = uuid();
    db.transaction(() => {
      db.prepare('INSERT INTO conversations (id, institute_id, member_a, member_b) VALUES (?, ?, ?, ?)').run(id, instituteId, memberA, memberB);
      db.prepare('INSERT INTO conversation_members (conversation_id, user_id) VALUES (?, ?), (?, ?)').run(id, memberA, id, memberB);
    })();
    conversation = { id };
  }
  const messageId = uuid();
  db.transaction(() => {
    db.prepare('INSERT INTO messages (id, conversation_id, sender_id, client_message_id, body) VALUES (?, ?, ?, ?, ?)')
      .run(messageId, conversation.id, senderId, clientMessageId, body);
    db.prepare("UPDATE conversations SET updated_at = datetime('now') WHERE id = ?").run(conversation.id);
    db.prepare('UPDATE conversation_members SET last_read_at = datetime(\'now\') WHERE conversation_id = ? AND user_id = ?').run(conversation.id, senderId);
    const sender = db.prepare('SELECT name FROM users WHERE id = ?').get(senderId) as any;
    createNotification(recipientId, 'message', `Message from ${sender?.name || req.user!.email}`, body.slice(0, 180), `/${peer.role}/messages`);
  })();
  const message = db.prepare('SELECT id, sender_id, body, created_at FROM messages WHERE id = ?').get(messageId);
  res.status(201).json({ message, conversationId: conversation.id });
}

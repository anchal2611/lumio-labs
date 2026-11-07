import { Response } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db/database';
import { AuthRequest } from '../middleware/auth';

export function recordAudit(req: AuthRequest, action: string, entityType: string, entityId: string | null, details = ''): void {
  const instituteId = req.user?.instituteId;
  if (!instituteId || !req.user) return;
  db.prepare(`INSERT INTO audit_logs (id, institute_id, actor_id, actor_email, action, entity_type, entity_id, details, ip_address)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    uuid(), instituteId, req.user.userId, req.user.email, action, entityType, entityId, details.slice(0, 2000), req.ip || null,
  );
}

export function createNotification(userId: string, type: string, title: string, body: string, link: string | null = null): void {
  db.prepare(`INSERT INTO notifications (id, user_id, type, title, body, link) VALUES (?, ?, ?, ?, ?, ?)`)
    .run(uuid(), userId, type.slice(0, 60), title.slice(0, 160), body.slice(0, 1000), link);
}

export function listAuditLogs(req: AuthRequest, res: Response): void {
  if (!req.user?.instituteId) {
    res.status(403).json({ error: 'Admin must be associated with an institute.' });
    return;
  }
  const page = Math.max(1, Math.min(10000, Number.parseInt(String(req.query.page || '1'), 10) || 1));
  const limit = Math.max(1, Math.min(100, Number.parseInt(String(req.query.limit || '50'), 10) || 50));
  const search = String(req.query.search || '').trim().slice(0, 120);
  const whereSearch = search ? 'AND (action LIKE ? OR entity_type LIKE ? OR actor_email LIKE ? OR details LIKE ?)' : '';
  const params: any[] = [req.user.instituteId];
  if (search) params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  const total = (db.prepare(`SELECT COUNT(*) AS total FROM audit_logs WHERE institute_id = ? ${whereSearch}`).get(...params) as any)?.total || 0;
  const logs = db.prepare(`SELECT id, created_at, actor_email, action, entity_type, entity_id, details, ip_address
    FROM audit_logs WHERE institute_id = ? ${whereSearch} ORDER BY created_at DESC, rowid DESC LIMIT ? OFFSET ?`)
    .all(...params, limit, (page - 1) * limit);
  res.json({ logs, page, limit, total, pages: Math.ceil(total / limit) });
}

export function listNotifications(req: AuthRequest, res: Response): void {
  const limit = Math.max(1, Math.min(100, Number.parseInt(String(req.query.limit || '50'), 10) || 50));
  const notifications = db.prepare(`SELECT id, type, title, body, link, read_at, created_at
    FROM notifications WHERE user_id = ? ORDER BY created_at DESC, rowid DESC LIMIT ?`).all(req.user!.userId, limit);
  const unreadCount = (db.prepare('SELECT COUNT(*) AS count FROM notifications WHERE user_id = ? AND read_at IS NULL').get(req.user!.userId) as any)?.count || 0;
  res.json({ notifications, unreadCount });
}

export function markNotificationRead(req: AuthRequest, res: Response): void {
  const result = db.prepare("UPDATE notifications SET read_at = datetime('now') WHERE id = ? AND user_id = ?")
    .run(req.params.id, req.user!.userId);
  if (!result.changes) {
    res.status(404).json({ error: 'Notification not found.' });
    return;
  }
  res.json({ message: 'Notification marked as read.' });
}

export function markAllNotificationsRead(req: AuthRequest, res: Response): void {
  db.prepare("UPDATE notifications SET read_at = datetime('now') WHERE user_id = ? AND read_at IS NULL").run(req.user!.userId);
  res.json({ message: 'Notifications marked as read.' });
}

import { Response } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db/database.js';
import { AuthRequest } from '../middleware/auth.js';

// POST /api/collab/sessions
export function createSession(req: AuthRequest, res: Response): void {
  try {
    const { name, type, classId, language, initialCode } = req.body;
    if (!name) {
      res.status(400).json({ error: 'Session name is required.' });
      return;
    }

    // For faculty sessions, only teachers/admins can create them
    if (type === 'faculty' && req.user!.role === 'student') {
      res.status(403).json({ error: 'Only teachers can create faculty sessions.' });
      return;
    }

    // For class sessions, verify class ownership
    if (type === 'class' && classId) {
      const cls = db.prepare('SELECT id FROM classes WHERE id = ? AND teacher_id = ?').get(classId, req.user!.userId);
      if (!cls) {
        res.status(403).json({ error: 'You do not own this class.' });
        return;
      }
    }

    const id = uuid();
    db.prepare(`
      INSERT INTO collab_sessions (id, name, type, class_id, host_id, language, initial_code, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `).run(id, name.trim(), type || 'peer', classId || null, req.user!.userId, language || 'python', initialCode || '');

    const session = db.prepare('SELECT * FROM collab_sessions WHERE id = ?').get(id) as any;
    const host = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(req.user!.userId);

    res.status(201).json({ ...session, host });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create collab session.' });
  }
}

// GET /api/collab/sessions
export function listSessions(req: AuthRequest, res: Response): void {
  const user = req.user!;
  const { type, classId } = req.query as any;

  let query = `
    SELECT cs.*, u.name as host_name, u.role as host_role,
      CASE WHEN c.name IS NOT NULL THEN c.name ELSE NULL END as class_name
    FROM collab_sessions cs
    JOIN users u ON u.id = cs.host_id
    LEFT JOIN classes c ON c.id = cs.class_id
    WHERE cs.is_active = 1
  `;
  const params: any[] = [];

  if (type) { query += ' AND cs.type = ?'; params.push(type); }
  if (classId) { query += ' AND cs.class_id = ?'; params.push(classId); }

  // Students: see peer sessions + faculty sessions (but not class sessions of other institutes)
  if (user.role === 'student' && user.instituteId) {
    query += ' AND (cs.class_id IS NULL OR cs.class_id IN (SELECT class_id FROM class_enrollments WHERE student_id = ?))';
    params.push(user.userId);
  }

  query += ' ORDER BY cs.created_at DESC LIMIT 50';
  const sessions = db.prepare(query).all(...params);

  res.json({ sessions });
}

// GET /api/collab/sessions/:id
export function getSession(req: AuthRequest, res: Response): void {
  const { id } = req.params;
  const session = db.prepare(`
    SELECT cs.*, u.name as host_name, u.role as host_role, u.email as host_email
    FROM collab_sessions cs
    JOIN users u ON u.id = cs.host_id
    WHERE cs.id = ?
  `).get(id) as any;

  if (!session) {
    res.status(404).json({ error: 'Session not found.' });
    return;
  }

  res.json(session);
}

// DELETE /api/collab/sessions/:id — end session
export function endSession(req: AuthRequest, res: Response): void {
  const { id } = req.params;
  const session = db.prepare('SELECT * FROM collab_sessions WHERE id = ? AND host_id = ?').get(id, req.user!.userId) as any;
  if (!session) {
    res.status(404).json({ error: 'Session not found or you are not the host.' });
    return;
  }
  db.prepare('UPDATE collab_sessions SET is_active = 0 WHERE id = ?').run(id);
  res.json({ message: 'Session ended.' });
}

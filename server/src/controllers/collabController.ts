import { Response } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db/database';
import { AuthRequest } from '../middleware/auth';
import { notifySessionEnded } from '../sockets/collabSocket';
import { recordAudit } from './activityController';

// POST /api/collab/sessions
export function createSession(req: AuthRequest, res: Response): void {
  try {
    const { name, type, classId, language, initialCode } = req.body;
    if (!name) {
      res.status(400).json({ error: 'Session name is required.' });
      return;
    }

    const sessionType = type || 'peer';
    if (!['peer', 'faculty', 'class'].includes(sessionType)) {
      res.status(400).json({ error: 'Session type must be peer, faculty, or class.' });
      return;
    }
    // Faculty and class sessions require a teacher or institute administrator.
    if ((sessionType === 'faculty' || sessionType === 'class') && !['teacher', 'admin'].includes(req.user!.role)) {
      res.status(403).json({ error: 'Only faculty can create faculty or class sessions.' });
      return;
    }

    if (sessionType === 'class' && !classId) {
      res.status(400).json({ error: 'Choose a class for a class session.' });
      return;
    }
    // For class sessions, verify teacher ownership or admin institute scope.
    if (sessionType === 'class') {
      const cls = db.prepare('SELECT id, institute_id FROM classes WHERE id = ? AND (teacher_id = ? OR institute_id = ?)').get(classId, req.user!.userId, req.user!.role === 'admin' ? req.user!.instituteId : '__no_institute__');
      if (!cls) {
        res.status(403).json({ error: 'You do not have access to this class.' });
        return;
      }
    }

    if (typeof name !== 'string' || !name.trim() || name.trim().length > 120 || (initialCode && (typeof initialCode !== 'string' || initialCode.length > 100_000))) {
      res.status(400).json({ error: 'Session name must be 1–120 characters and initial code must be at most 100000 characters.' });
      return;
    }

    const id = uuid();
    db.prepare(`
      INSERT INTO collab_sessions (id, name, type, class_id, host_id, language, initial_code, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, 1)
    `).run(id, name.trim(), sessionType, classId || null, req.user!.userId, language || 'python', initialCode || '');

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
  if (user.role === 'student') {
    query += ' AND (cs.host_id = ? OR (u.institute_id = ? AND ? IS NOT NULL) OR cs.class_id IN (SELECT class_id FROM class_enrollments WHERE student_id = ?))';
    params.push(user.userId, user.instituteId, user.instituteId, user.userId);
  } else if (user.role === 'teacher') {
    query += ' AND (cs.host_id = ? OR (u.institute_id = ? AND ? IS NOT NULL) OR c.teacher_id = ?)';
    params.push(user.userId, user.instituteId, user.instituteId, user.userId);
  } else if (user.role === 'admin') {
    if (!user.instituteId) {
      res.status(403).json({ error: 'Admin must be associated with an institute.' });
      return;
    }
    query += ' AND (cs.host_id = ? OR u.institute_id = ? OR c.institute_id = ?)';
    params.push(user.userId, user.instituteId, user.instituteId);
  }

  query += ' ORDER BY cs.created_at DESC LIMIT 50';
  const sessions = db.prepare(query).all(...params);

  res.json({ sessions });
}

// GET /api/collab/sessions/:id
export function getSession(req: AuthRequest, res: Response): void {
  const { id } = req.params;
  const session = db.prepare(`
    SELECT cs.*, u.name as host_name, u.role as host_role
    FROM collab_sessions cs
    JOIN users u ON u.id = cs.host_id
    WHERE cs.id = ?
  `).get(id) as any;

  if (!session) {
    res.status(404).json({ error: 'Session not found.' });
    return;
  }

  const user = req.user!;
  if (session.class_id) {
    const cls = db.prepare('SELECT teacher_id, institute_id FROM classes WHERE id = ?').get(session.class_id) as any;
    const allowed = user.role === 'student'
      ? Boolean(db.prepare('SELECT 1 FROM class_enrollments WHERE class_id = ? AND student_id = ?').get(session.class_id, user.userId))
      : user.role === 'teacher' ? cls?.teacher_id === user.userId
      : user.role === 'admin' ? Boolean(user.instituteId && cls?.institute_id === user.instituteId)
      : false;
    if (!allowed && session.host_id !== user.userId) {
      res.status(403).json({ error: 'You do not have access to this session.' });
      return;
    }
  } else if (session.host_id !== user.userId && !['student', 'teacher', 'admin'].includes(user.role)) {
    res.status(403).json({ error: 'You do not have access to this session.' });
    return;
  }

  res.json(session);
}

// DELETE /api/collab/sessions/:id — end session
export function endSession(req: AuthRequest, res: Response): void {
  const { id } = req.params;
  const session = db.prepare(`SELECT cs.*, u.institute_id AS host_institute_id, c.institute_id AS class_institute_id
    FROM collab_sessions cs JOIN users u ON u.id = cs.host_id LEFT JOIN classes c ON c.id = cs.class_id WHERE cs.id = ?`).get(id) as any;
  if (!session) {
    res.status(404).json({ error: 'Session not found.' });
    return;
  }
  const isHost = session.host_id === req.user!.userId;
  const isInstituteAdmin = req.user!.role === 'admin' && req.user!.instituteId &&
    (session.host_institute_id === req.user!.instituteId || session.class_institute_id === req.user!.instituteId);
  if (!isHost && !isInstituteAdmin) {
    res.status(403).json({ error: 'Only the host or an administrator from the same institute can end this session.' });
    return;
  }
  db.prepare('UPDATE collab_sessions SET is_active = 0 WHERE id = ?').run(id);
  notifySessionEnded(id);
  recordAudit(req, 'collab_session.ended', 'collaboration_session', id, `Ended collaboration session "${session.name}".`);
  res.json({ message: 'Session ended.' });
}

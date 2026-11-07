import { Response } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db/database';
import { AuthRequest } from '../middleware/auth';

function generateJoinCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 7; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function ensureUniqueJoinCode(): string {
  let code = generateJoinCode();
  while (db.prepare('SELECT id FROM classes WHERE join_code = ?').get(code)) {
    code = generateJoinCode();
  }
  return code;
}

// POST /api/classes
export function createClass(req: AuthRequest, res: Response): void {
  try {
    const { name, subject, description, bannerColor } = req.body;
    if (!name || !subject) {
      res.status(400).json({ error: 'Class name and subject are required.' });
      return;
    }

    const classId = uuid();
    const joinCode = ensureUniqueJoinCode();

    db.prepare(`
      INSERT INTO classes (id, name, subject, description, join_code, teacher_id, institute_id, banner_color)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(classId, name.trim(), subject.trim(), description || null, joinCode, req.user!.userId, req.user!.instituteId, bannerColor || '#2563EB');

    const cls = db.prepare('SELECT * FROM classes WHERE id = ?').get(classId) as any;
    res.status(201).json({ ...cls, joinCode });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create class.' });
  }
}

// GET /api/classes
export function listClasses(req: AuthRequest, res: Response): void {
  const user = req.user!;

  let classes: any[];
  if (user.role === 'teacher' || user.role === 'admin') {
    if (user.role === 'admin' && !user.instituteId) {
      res.status(403).json({ error: 'Admin must be associated with an institute.' });
      return;
    }
    classes = db.prepare(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM class_enrollments WHERE class_id = c.id) as student_count,
        (SELECT COUNT(*) FROM lab_modules WHERE class_id = c.id) as lab_count,
        u.name as teacher_name
      FROM classes c
      JOIN users u ON u.id = c.teacher_id
      WHERE ${user.role === 'admin' ? 'c.institute_id = ?' : 'c.teacher_id = ?'}
      ORDER BY c.created_at DESC
    `).all(user.role === 'admin' ? user.instituteId : user.userId);
  } else {
    // Student: get enrolled classes
    classes = db.prepare(`
      SELECT c.*, 
        (SELECT COUNT(*) FROM class_enrollments WHERE class_id = c.id) as student_count,
        (SELECT COUNT(*) FROM lab_modules WHERE class_id = c.id) as lab_count,
        u.name as teacher_name
      FROM classes c
      JOIN class_enrollments ce ON ce.class_id = c.id
      JOIN users u ON u.id = c.teacher_id
      WHERE ce.student_id = ?
      ORDER BY c.created_at DESC
    `).all(user.userId);
  }

  res.json({ classes });
}

// POST /api/classes/join
export function joinClass(req: AuthRequest, res: Response): void {
  const { joinCode } = req.body;
  if (!joinCode) {
    res.status(400).json({ error: 'Join code is required.' });
    return;
  }

  const cls = db.prepare('SELECT * FROM classes WHERE join_code = ? AND is_active = 1').get(joinCode.toUpperCase().trim()) as any;
  if (!cls) {
    res.status(404).json({ error: 'Invalid join code. Please check and try again.' });
    return;
  }

  const existing = db.prepare('SELECT * FROM class_enrollments WHERE class_id = ? AND student_id = ?').get(cls.id, req.user!.userId);
  if (existing) {
    res.status(409).json({ error: 'You are already enrolled in this class.' });
    return;
  }

  db.prepare('INSERT INTO class_enrollments (class_id, student_id) VALUES (?, ?)').run(cls.id, req.user!.userId);
  if (cls.institute_id) {
    db.prepare('UPDATE users SET institute_id = ? WHERE id = ? AND institute_id IS NULL').run(cls.institute_id, req.user!.userId);
  }

  const teacher = db.prepare('SELECT name, email FROM users WHERE id = ?').get(cls.teacher_id) as any;
  res.json({
    message: `Successfully joined "${cls.name}"!`,
    class: { id: cls.id, name: cls.name, subject: cls.subject, teacher: teacher?.name, joinCode: cls.join_code },
  });
}

// GET /api/classes/:id
export function getClass(req: AuthRequest, res: Response): void {
  const { id } = req.params;
  const cls = db.prepare('SELECT * FROM classes WHERE id = ?').get(id) as any;
  if (!cls) {
    res.status(404).json({ error: 'Class not found.' });
    return;
  }

  // Check access
  const user = req.user!;
  if (user.role === 'student') {
    const enrolled = db.prepare('SELECT 1 FROM class_enrollments WHERE class_id = ? AND student_id = ?').get(id, user.userId);
    if (!enrolled) {
      res.status(403).json({ error: 'You are not enrolled in this class.' });
      return;
    }
  } else if (user.role === 'teacher' && cls.teacher_id !== user.userId) {
    res.status(403).json({ error: 'You do not have access to this class.' });
    return;
  } else if (user.role === 'admin' && (!user.instituteId || cls.institute_id !== user.instituteId)) {
    res.status(403).json({ error: 'You do not have access to this class.' });
    return;
  }

  const teacher = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(cls.teacher_id);
  const students = db.prepare(`
    SELECT u.id, u.name, u.email, sp.roll_number, sp.branch, ce.enrolled_at
    FROM class_enrollments ce
    JOIN users u ON u.id = ce.student_id
    LEFT JOIN student_profiles sp ON sp.user_id = u.id
    WHERE ce.class_id = ?
    ORDER BY ce.enrolled_at DESC
  `).all(id);

  const labs = db.prepare('SELECT id, title, description, category, difficulty, language, is_published, created_at FROM lab_modules WHERE class_id = ? ORDER BY created_at DESC').all(id);
  const assignments = db.prepare('SELECT * FROM assignments WHERE class_id = ? ORDER BY created_at DESC').all(id);

  res.json({ ...cls, teacher, students, labs, assignments, studentCount: students.length });
}

// GET /api/classes/:id/students
export function getClassStudents(req: AuthRequest, res: Response): void {
  const { id } = req.params;
  const cls = db.prepare('SELECT id, teacher_id, institute_id FROM classes WHERE id = ?').get(id) as any;
  if (!cls) {
    res.status(404).json({ error: 'Class not found.' });
    return;
  }
  if (req.user!.role === 'teacher' && cls.teacher_id !== req.user!.userId) {
    res.status(403).json({ error: 'You do not have access to this class roster.' });
    return;
  }
  if (req.user!.role === 'admin' && (!req.user!.instituteId || cls.institute_id !== req.user!.instituteId)) {
    res.status(403).json({ error: 'You do not have access to this class roster.' });
    return;
  }
  const students = db.prepare(`
    SELECT u.id, u.name, u.email, sp.roll_number, sp.branch, sp.semester, ce.enrolled_at
    FROM class_enrollments ce
    JOIN users u ON u.id = ce.student_id
    LEFT JOIN student_profiles sp ON sp.user_id = u.id
    WHERE ce.class_id = ?
    ORDER BY ce.enrolled_at ASC
  `).all(id);
  res.json({ students });
}

// DELETE /api/classes/:id
export function deleteClass(req: AuthRequest, res: Response): void {
  const { id } = req.params;
  const cls = db.prepare('SELECT * FROM classes WHERE id = ? AND teacher_id = ?').get(id, req.user!.userId) as any;
  if (!cls) {
    res.status(404).json({ error: 'Class not found or you do not own this class.' });
    return;
  }
  db.prepare('DELETE FROM classes WHERE id = ?').run(id);
  res.json({ message: 'Class deleted successfully.' });
}

// PATCH /api/classes/:id/regenerate-code
export function regenerateCode(req: AuthRequest, res: Response): void {
  const { id } = req.params;
  const cls = db.prepare('SELECT * FROM classes WHERE id = ? AND teacher_id = ?').get(id, req.user!.userId) as any;
  if (!cls) {
    res.status(404).json({ error: 'Class not found.' });
    return;
  }
  const newCode = ensureUniqueJoinCode();
  db.prepare('UPDATE classes SET join_code = ? WHERE id = ?').run(newCode, id);
  res.json({ joinCode: newCode });
}

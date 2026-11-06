import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import db from '../db/database';
import { AuthRequest } from '../middleware/auth';

// POST /api/admin/teachers — create teacher account
export async function createTeacher(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user?.instituteId) {
      res.status(403).json({ error: 'Admin must be part of an institute.' });
      return;
    }

    const { name, email, designation, department, employeeId } = req.body;
    if (!name || !email) {
      res.status(400).json({ error: 'Name and email are required.' });
      return;
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }

    // Generate temporary password
    const tempPassword = `Lumio@${Math.floor(100000 + Math.random() * 900000)}`;
    const passwordHash = await bcrypt.hash(tempPassword, 10);
    const teacherId = uuid();

    db.prepare(`
      INSERT INTO users (id, name, email, password_hash, role, institute_id, is_verified, status)
      VALUES (?, ?, ?, ?, 'teacher', ?, 1, 'active')
    `).run(teacherId, name.trim(), email.toLowerCase(), passwordHash, req.user.instituteId);

    db.prepare(`
      INSERT INTO teacher_profiles (user_id, designation, department, employee_id)
      VALUES (?, ?, ?, ?)
    `).run(teacherId, designation || null, department || null, employeeId || null);

    res.status(201).json({
      message: 'Teacher account created.',
      teacher: { id: teacherId, name, email, designation, department },
      temporaryPassword: tempPassword,
      note: 'Please share this temporary password securely. The teacher should change it upon first login.',
    });
  } catch (err: any) {
    console.error('Create teacher error:', err);
    res.status(500).json({ error: 'Failed to create teacher account.' });
  }
}

// GET /api/admin/teachers
export function getTeachers(req: AuthRequest, res: Response): void {
  if (!req.user?.instituteId) {
    res.status(403).json({ error: 'Admin must be part of an institute.' });
    return;
  }

  const teachers = db.prepare(`
    SELECT u.id, u.name, u.email, u.status, u.created_at,
           tp.designation, tp.department, tp.employee_id
    FROM users u
    LEFT JOIN teacher_profiles tp ON tp.user_id = u.id
    WHERE u.institute_id = ? AND u.role = 'teacher'
    ORDER BY u.created_at DESC
  `).all(req.user.instituteId);

  res.json({ teachers });
}

// GET /api/admin/students
export function getStudents(req: AuthRequest, res: Response): void {
  if (!req.user?.instituteId) {
    res.status(403).json({ error: 'Admin must be part of an institute.' });
    return;
  }

  const students = db.prepare(`
    SELECT u.id, u.name, u.email, u.status, u.created_at,
           sp.roll_number, sp.branch, sp.semester, sp.department
    FROM users u
    LEFT JOIN student_profiles sp ON sp.user_id = u.id
    WHERE u.institute_id = ? AND u.role = 'student'
    ORDER BY u.created_at DESC
  `).all(req.user.instituteId);

  res.json({ students });
}

// PATCH /api/admin/users/:id/status
export function updateUserStatus(req: AuthRequest, res: Response): void {
  if (!req.user?.instituteId) {
    res.status(403).json({ error: 'Admin access required.' });
    return;
  }

  const { id } = req.params;
  const { status } = req.body;

  if (!['active', 'inactive', 'suspended'].includes(status)) {
    res.status(400).json({ error: 'Invalid status. Must be active, inactive, or suspended.' });
    return;
  }

  // Verify user belongs to same institute
  const user = db.prepare('SELECT id, role FROM users WHERE id = ? AND institute_id = ?').get(id, req.user.instituteId) as any;
  if (!user) {
    res.status(404).json({ error: 'User not found in your institute.' });
    return;
  }

  // Admin cannot suspend themselves
  if (id === req.user.userId) {
    res.status(400).json({ error: 'You cannot change your own status.' });
    return;
  }

  db.prepare('UPDATE users SET status = ? WHERE id = ?').run(status, id);
  res.json({ message: `User status updated to ${status}.` });
}

// GET /api/admin/stats
export function getStats(req: AuthRequest, res: Response): void {
  if (!req.user?.instituteId) {
    res.status(403).json({ error: 'Admin access required.' });
    return;
  }

  const iid = req.user.instituteId;
  const stats = {
    totalStudents: (db.prepare("SELECT COUNT(*) as c FROM users WHERE institute_id = ? AND role = 'student'").get(iid) as any)?.c || 0,
    totalTeachers: (db.prepare("SELECT COUNT(*) as c FROM users WHERE institute_id = ? AND role = 'teacher'").get(iid) as any)?.c || 0,
    totalClasses: (db.prepare('SELECT COUNT(*) as c FROM classes WHERE institute_id = ?').get(iid) as any)?.c || 0,
    activeStudents: (db.prepare("SELECT COUNT(*) as c FROM users WHERE institute_id = ? AND role = 'student' AND status = 'active'").get(iid) as any)?.c || 0,
    pendingVerifications: (db.prepare("SELECT COUNT(*) as c FROM users WHERE institute_id = ? AND is_verified = 0").get(iid) as any)?.c || 0,
    recentJoins: db.prepare("SELECT id, name, email, role, created_at FROM users WHERE institute_id = ? ORDER BY created_at DESC LIMIT 5").all(iid),
  };

  res.json(stats);
}

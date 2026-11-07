import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import db from '../db/database';
import { AuthRequest } from '../middleware/auth';
import { firebaseAdminAuth, hasFirebaseAdminCredentials } from '../config/firebaseAdmin';
import { createNotification, recordAudit } from './activityController';

// POST /api/admin/teachers — create teacher account
export async function createTeacher(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user?.instituteId) {
      res.status(403).json({ error: 'Admin must be part of an institute.' });
      return;
    }

    const { name, email, password, designation, department, employeeId } = req.body;
    if (typeof name !== 'string' || !name.trim() || name.trim().length > 120 || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      res.status(400).json({ error: 'Name and email are required.' });
      return;
    }
    if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
      res.status(400).json({ error: 'Password must be between 8 and 128 characters.' });
      return;
    }
    if ([designation, department, employeeId].some((value) => value !== undefined && value !== null && (typeof value !== 'string' || value.length > 120))) {
      res.status(400).json({ error: 'Teacher profile fields must be 120 characters or fewer.' });
      return;
    }
    const normalizedEmail = email.trim().toLowerCase();

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }

    if (process.env.NODE_ENV === 'production' && !hasFirebaseAdminCredentials) {
      res.status(503).json({ error: 'Teacher account provisioning requires FIREBASE_SERVICE_ACCOUNT_JSON in the server environment.' });
      return;
    }

    let teacherId = uuid();
    let firebaseUserCreated = false;
    if (hasFirebaseAdminCredentials) {
      try {
        const firebaseUser = await firebaseAdminAuth.createUser({
          email: normalizedEmail, password, displayName: name.trim(), emailVerified: true,
        });
        teacherId = firebaseUser.uid;
        firebaseUserCreated = true;
      } catch (err: any) {
        if (err?.code === 'auth/email-already-exists') {
          res.status(409).json({ error: 'A Firebase account with this email already exists.' });
          return;
        }
        throw err;
      }
    }

    try {
      const passwordHash = hasFirebaseAdminCredentials ? 'firebase-managed' : await bcrypt.hash(password, 10);
      db.transaction(() => {
        db.prepare(`
          INSERT INTO users (id, name, email, password_hash, role, institute_id, is_verified, status)
          VALUES (?, ?, ?, ?, 'teacher', ?, 1, 'active')
        `).run(teacherId, name.trim(), normalizedEmail, passwordHash, req.user!.instituteId);

        db.prepare(`
          INSERT INTO teacher_profiles (user_id, designation, department, employee_id)
          VALUES (?, ?, ?, ?)
        `).run(teacherId, designation || null, department || null, employeeId || null);
        recordAudit(req, 'teacher.created', 'user', teacherId, `Created teacher account for ${normalizedEmail}.`);
      })();
    } catch (err) {
      if (firebaseUserCreated) await firebaseAdminAuth.deleteUser(teacherId).catch(() => {});
      throw err;
    }

    res.status(201).json({
      message: 'Teacher account created.',
      teacher: { id: teacherId, name: name.trim(), email: normalizedEmail, designation, department, status: 'active', created_at: new Date().toISOString() },
      note: 'The teacher can sign in with the email and password set by the administrator.',
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
    WHERE u.role = 'student' AND (
      u.institute_id = ? OR (u.institute_id IS NULL AND EXISTS (
        SELECT 1 FROM class_enrollments ce JOIN classes c ON c.id = ce.class_id
        WHERE ce.student_id = u.id AND c.institute_id = ?
      ))
    )
    ORDER BY u.created_at DESC
  `).all(req.user.instituteId, req.user.instituteId);

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
  const user = db.prepare(`SELECT u.id, u.role FROM users u WHERE u.id = ? AND (
    u.institute_id = ? OR (u.institute_id IS NULL AND u.role = 'student' AND EXISTS (
      SELECT 1 FROM class_enrollments ce JOIN classes c ON c.id = ce.class_id
      WHERE ce.student_id = u.id AND c.institute_id = ?
    ))
  )`).get(id, req.user.instituteId, req.user.instituteId) as any;
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
  recordAudit(req, `user.${status}`, 'user', id, `Changed ${user.role} account status to ${status}.`);
  createNotification(id, 'account_status', 'Account status updated', `Your account is now ${status}.`, `/${user.role}/settings`);
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
    totalStudents: (db.prepare(`SELECT COUNT(DISTINCT u.id) as c FROM users u WHERE u.role = 'student' AND (
      u.institute_id = ? OR (u.institute_id IS NULL AND EXISTS (SELECT 1 FROM class_enrollments ce JOIN classes c ON c.id = ce.class_id WHERE ce.student_id = u.id AND c.institute_id = ?))
    )`).get(iid, iid) as any)?.c || 0,
    totalTeachers: (db.prepare("SELECT COUNT(*) as c FROM users WHERE institute_id = ? AND role = 'teacher'").get(iid) as any)?.c || 0,
    totalClasses: (db.prepare('SELECT COUNT(*) as c FROM classes WHERE institute_id = ?').get(iid) as any)?.c || 0,
    totalLabs: (db.prepare('SELECT COUNT(*) as c FROM lab_modules lm JOIN users u ON u.id = lm.teacher_id WHERE u.institute_id = ?').get(iid) as any)?.c || 0,
    activeStudents: (db.prepare(`SELECT COUNT(DISTINCT u.id) as c FROM users u WHERE u.role = 'student' AND u.status = 'active' AND (
      u.institute_id = ? OR (u.institute_id IS NULL AND EXISTS (SELECT 1 FROM class_enrollments ce JOIN classes c ON c.id = ce.class_id WHERE ce.student_id = u.id AND c.institute_id = ?))
    )`).get(iid, iid) as any)?.c || 0,
    pendingVerifications: (db.prepare("SELECT COUNT(*) as c FROM users WHERE institute_id = ? AND is_verified = 0").get(iid) as any)?.c || 0,
    recentJoins: db.prepare("SELECT id, name, email, role, status, created_at FROM users WHERE institute_id = ? ORDER BY created_at DESC LIMIT 5").all(iid),
  };

  res.json(stats);
}

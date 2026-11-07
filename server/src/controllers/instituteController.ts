import { Response } from 'express';
import { v4 as uuid } from 'uuid';
import bcrypt from 'bcryptjs';
import db from '../db/database';
import { AuthRequest } from '../middleware/auth';

// POST /api/institutes/register — creates institute + admin account
export async function registerInstitute(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { instituteName, slug, type, city, website, adminName, adminEmail, adminPassword, emailDomains } = req.body;
    const firebaseUser = req.firebaseUser;

    if (!instituteName || !adminName || !adminEmail || (!adminPassword && !firebaseUser)) {
      res.status(400).json({ error: 'Institute name, admin name and email are required.' });
      return;
    }
    if (firebaseUser && firebaseUser.email.toLowerCase() !== String(adminEmail).toLowerCase()) {
      res.status(403).json({ error: 'Firebase account email does not match admin email.' });
      return;
    }

    // Check slug uniqueness
    const slugToUse = (slug || instituteName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')).trim();
    const slugExists = db.prepare('SELECT id FROM institutes WHERE slug = ?').get(slugToUse);
    if (slugExists) {
      res.status(409).json({ error: 'An institute with this slug already exists. Please choose a different name.' });
      return;
    }

    // Check admin email uniqueness
    const emailExists = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail.toLowerCase());
    if (emailExists) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }

    const instituteId = uuid();
    const adminId = firebaseUser?.uid || uuid();
    const passwordHash = firebaseUser ? 'firebase-managed' : await bcrypt.hash(adminPassword, 10);
    const domains = JSON.stringify(Array.isArray(emailDomains) ? emailDomains : []);

    db.prepare(`
      INSERT INTO institutes (id, name, slug, type, city, website, email_domains, admin_user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(instituteId, instituteName.trim(), slugToUse, type || 'university', city || null, website || null, domains, adminId);

    db.prepare(`
      INSERT INTO users (id, name, email, password_hash, role, institute_id, is_verified, status)
      VALUES (?, ?, ?, ?, 'admin', ?, 1, 'active')
    `).run(adminId, adminName.trim(), adminEmail.toLowerCase(), passwordHash, instituteId);

    // Update institute admin reference
    db.prepare('UPDATE institutes SET admin_user_id = ? WHERE id = ?').run(adminId, instituteId);

    res.status(201).json({
      message: 'Institute registered successfully.',
      institute: { id: instituteId, name: instituteName, slug: slugToUse },
      admin: { id: adminId, name: adminName, email: adminEmail },
    });
  } catch (err: any) {
    console.error('Institute register error:', err);
    res.status(500).json({ error: 'Institute registration failed.' });
  }
}

// GET /api/institutes/me
export function getMyInstitute(req: AuthRequest, res: Response): void {
  if (!req.user?.instituteId) {
    res.status(404).json({ error: 'No institute associated with this account.' });
    return;
  }
  const institute = db.prepare('SELECT * FROM institutes WHERE id = ?').get(req.user.instituteId) as any;
  if (!institute) {
    res.status(404).json({ error: 'Institute not found.' });
    return;
  }

  const stats = {
    totalStudents: (db.prepare('SELECT COUNT(*) as c FROM users WHERE institute_id = ? AND role = ?').get(req.user.instituteId, 'student') as any)?.c || 0,
    totalTeachers: (db.prepare('SELECT COUNT(*) as c FROM users WHERE institute_id = ? AND role = ?').get(req.user.instituteId, 'teacher') as any)?.c || 0,
    totalClasses: (db.prepare('SELECT COUNT(*) as c FROM classes WHERE institute_id = ?').get(req.user.instituteId) as any)?.c || 0,
    totalLabs: (db.prepare(`
      SELECT COUNT(*) as c FROM lab_modules lm
      JOIN classes c ON c.id = lm.class_id
      WHERE c.institute_id = ?
    `).get(req.user.instituteId) as any)?.c || 0,
  };

  res.json({
    ...institute,
    email_domains: JSON.parse(institute.email_domains || '[]'),
    stats,
  });
}

// PUT /api/institutes/me/domains
export function updateDomains(req: AuthRequest, res: Response): void {
  if (!req.user?.instituteId) {
    res.status(403).json({ error: 'No institute associated.' });
    return;
  }
  const { domains } = req.body;
  if (!Array.isArray(domains)) {
    res.status(400).json({ error: 'domains must be an array of strings.' });
    return;
  }

  const cleaned = domains.map((d: string) => d.trim().toLowerCase()).filter(Boolean);
  db.prepare('UPDATE institutes SET email_domains = ? WHERE id = ?').run(JSON.stringify(cleaned), req.user.instituteId);
  res.json({ message: 'Email domains updated.', domains: cleaned });
}

// GET /api/institutes/me/users
export function getInstituteUsers(req: AuthRequest, res: Response): void {
  if (!req.user?.instituteId) {
    res.status(403).json({ error: 'No institute associated.' });
    return;
  }
  const { role, page = '1', limit = '50' } = req.query as any;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let query = 'SELECT id, name, email, role, status, avatar, created_at FROM users WHERE institute_id = ?';
  const params: any[] = [req.user.instituteId];

  if (role) {
    query += ' AND role = ?';
    params.push(role);
  }
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), offset);

  const users = db.prepare(query).all(...params);
  const total = (db.prepare(`SELECT COUNT(*) as c FROM users WHERE institute_id = ?${role ? ' AND role = ?' : ''}`).get(...(role ? [req.user.instituteId, role] : [req.user.instituteId])) as any)?.c || 0;

  res.json({ users, total, page: parseInt(page), limit: parseInt(limit) });
}

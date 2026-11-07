import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import crypto from 'crypto';
import db from '../db/database';
import { signToken, signRefreshToken, verifyRefreshToken, AuthRequest, REFRESH_EXPIRES_IN } from '../middleware/auth';

function getInstituteIdByEmailDomain(email: string): string | null {
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return null;

  const institutes = db.prepare('SELECT id, email_domains FROM institutes').all() as any[];
  for (const inst of institutes) {
    try {
      const domains: string[] = JSON.parse(inst.email_domains || '[]');
      if (domains.map((d: string) => d.toLowerCase()).includes(domain)) {
        return inst.id;
      }
    } catch { /* skip malformed */ }
  }
  return null;
}

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { name, email, password, role, branch, semester, department, designation, employeeId, rollNumber } = req.body;
    const firebaseUser = (req as AuthRequest).firebaseUser;

    if (!name || !email || (!password && !firebaseUser)) {
      res.status(400).json({ error: 'Name and email are required.' });
      return;
    }
    if (firebaseUser && firebaseUser.email.toLowerCase() !== String(email).toLowerCase()) {
      res.status(403).json({ error: 'Firebase account email does not match registration email.' });
      return;
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }

    // Auto-detect institute from email domain
    const instituteId = getInstituteIdByEmailDomain(email);

    // Role logic: 
    // - If institute domain matches → role forced to 'student'
    // - Else use provided role (student/teacher as independent)
    // - Admin role can only be set via institute registration
    let finalRole = firebaseUser ? 'student' : (role || 'student');
    if (instituteId && finalRole === 'admin') finalRole = 'student';

    const passwordHash = firebaseUser ? 'firebase-managed' : await bcrypt.hash(password, 10);
    const userId = firebaseUser?.uid || uuid();

    db.prepare(`
      INSERT INTO users (id, name, email, password_hash, role, institute_id, is_verified, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active')
    `).run(userId, name.trim(), email.toLowerCase(), passwordHash, finalRole, instituteId, 1);

    // Insert role-specific profile
    if (finalRole === 'student') {
      const rollNum = rollNumber || `STU-${new Date().getFullYear()}-${Math.floor(Math.random() * 900) + 100}`;
      db.prepare(`
        INSERT INTO student_profiles (user_id, roll_number, branch, semester, department)
        VALUES (?, ?, ?, ?, ?)
      `).run(userId, rollNum, branch || null, semester || null, department || null);
    } else if (finalRole === 'teacher') {
      db.prepare(`
        INSERT INTO teacher_profiles (user_id, designation, department, employee_id)
        VALUES (?, ?, ?, ?)
      `).run(userId, designation || null, department || null, employeeId || null);
    }

    const user = db.prepare('SELECT id, name, email, role, institute_id, status, created_at FROM users WHERE id = ?').get(userId) as any;
    const institute = user.institute_id
      ? db.prepare('SELECT id, name, slug FROM institutes WHERE id = ?').get(user.institute_id) as any
      : null;

    const payload = { userId, email: email.toLowerCase(), role: finalRole, instituteId };
    const token = firebaseUser ? null : signToken(payload);
    const refreshToken = signRefreshToken(payload);

    // Store refresh token hash
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    db.prepare(`
      INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at)
      VALUES (?, ?, ?, ?)
    `).run(uuid(), userId, tokenHash, new Date(Date.now() + REFRESH_EXPIRES_IN).toISOString());

    res.status(201).json({
      ...(token ? { token } : {}),
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        instituteId: user.institute_id,
        institute: institute ? { id: institute.id, name: institute.name, slug: institute.slug } : null,
        status: user.status,
        createdAt: user.created_at,
      },
    });
  } catch (err: any) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase()) as any;
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    if (process.env.NODE_ENV === 'production' && process.env.SEED_DEMO_DATA !== 'true' && user.email.endsWith('@demo.lumio.app')) {
      res.status(401).json({ error: 'Demo accounts are disabled in production.' });
      return;
    }

    if (user.status === 'suspended') {
      res.status(403).json({ error: 'Your account has been suspended. Contact your administrator.' });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    // Fetch profile details
    let profile: any = {};
    if (user.role === 'student') {
      profile = db.prepare('SELECT * FROM student_profiles WHERE user_id = ?').get(user.id) || {};
    } else if (user.role === 'teacher') {
      profile = db.prepare('SELECT * FROM teacher_profiles WHERE user_id = ?').get(user.id) || {};
    }

    const institute = user.institute_id
      ? db.prepare('SELECT id, name, slug FROM institutes WHERE id = ?').get(user.institute_id) as any
      : null;

    const payload = { userId: user.id, email: user.email, role: user.role, instituteId: user.institute_id };
    const token = signToken(payload);
    const refreshToken = signRefreshToken(payload);

    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    db.prepare(`
      INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at)
      VALUES (?, ?, ?, ?)
    `).run(uuid(), user.id, tokenHash, new Date(Date.now() + REFRESH_EXPIRES_IN).toISOString());

    res.json({
      token,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        instituteId: user.institute_id,
        institute: institute ? { id: institute.id, name: institute.name, slug: institute.slug } : null,
        status: user.status,
        avatar: user.avatar,
        createdAt: user.created_at,
        profile,
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
}

export function logout(req: AuthRequest, res: Response): void {
  const { refreshToken } = req.body;
  if (refreshToken) {
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    db.prepare('DELETE FROM refresh_tokens WHERE token_hash = ?').run(tokenHash);
  }
  res.json({ message: 'Logged out successfully.' });
}

export function refresh(req: Request, res: Response): void {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    res.status(400).json({ error: 'Refresh token required.' });
    return;
  }

  const payload = verifyRefreshToken(refreshToken);
  if (!payload) {
    res.status(401).json({ error: 'Invalid or expired refresh token.' });
    return;
  }

  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  const stored = db.prepare('SELECT * FROM refresh_tokens WHERE token_hash = ? AND expires_at > datetime("now")').get(tokenHash);
  if (!stored) {
    res.status(401).json({ error: 'Refresh token revoked or expired.' });
    return;
  }

  const user = db.prepare('SELECT id, role, email, institute_id FROM users WHERE id = ?').get(payload.userId) as any;
  if (!user) {
    res.status(401).json({ error: 'User not found.' });
    return;
  }

  const newPayload = { userId: user.id, email: user.email, role: user.role, instituteId: user.institute_id };
  res.json({ token: signToken(newPayload) });
}

export function me(req: AuthRequest, res: Response): void {
  const user = db.prepare('SELECT id, name, email, role, institute_id, status, avatar, created_at FROM users WHERE id = ?').get(req.user!.userId) as any;
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }

  let profile: any = {};
  if (user.role === 'student') {
    profile = db.prepare('SELECT * FROM student_profiles WHERE user_id = ?').get(user.id) || {};
  } else if (user.role === 'teacher') {
    profile = db.prepare('SELECT * FROM teacher_profiles WHERE user_id = ?').get(user.id) || {};
  }

  const institute = user.institute_id
    ? db.prepare('SELECT id, name, slug, email_domains FROM institutes WHERE id = ?').get(user.institute_id) as any
    : null;

  res.json({
    id: user.id, name: user.name, email: user.email, role: user.role,
    instituteId: user.institute_id, institute, status: user.status,
    avatar: user.avatar, createdAt: user.created_at, profile,
  });
}

export function checkDomain(req: Request, res: Response): void {
  const { email } = req.query as { email: string };
  if (!email) {
    res.json({ matched: false, institute: null });
    return;
  }
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) {
    res.json({ matched: false, institute: null });
    return;
  }

  const institutes = db.prepare('SELECT id, name, slug, email_domains FROM institutes').all() as any[];
  for (const inst of institutes) {
    try {
      const domains: string[] = JSON.parse(inst.email_domains || '[]');
      if (domains.map((d: string) => d.toLowerCase()).includes(domain)) {
        res.json({ matched: true, institute: { id: inst.id, name: inst.name, slug: inst.slug } });
        return;
      }
    } catch { /* skip */ }
  }
  res.json({ matched: false, institute: null });
}

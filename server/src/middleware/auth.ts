import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import db from '../db/database';
import { firebaseAdminAuth } from '../config/firebaseAdmin';

const configuredJwtSecret = process.env.JWT_SECRET;
if (process.env.NODE_ENV === 'production' && (!configuredJwtSecret || configuredJwtSecret.length < 32)) {
  throw new Error('JWT_SECRET must be configured with at least 32 characters in production.');
}
const JWT_SECRET = configuredJwtSecret || 'lumio_jwt_secret_2026_please_change_in_production';
const JWT_EXPIRES_IN = '7d';
const REFRESH_EXPIRES_IN = 30 * 24 * 60 * 60 * 1000; // 30 days in ms

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  instituteId: string | null;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
  firebaseUser?: { uid: string; email: string; emailVerified: boolean };
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function signRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET + '_refresh', { expiresIn: '30d' });
}

export function verifyRefreshToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET + '_refresh') as JwtPayload;
  } catch {
    return null;
  }
}

function attachDatabaseUser(req: AuthRequest, res: Response, next: NextFunction, userId: string): boolean {
  const user = db.prepare('SELECT id, email, role, institute_id, status FROM users WHERE id = ?').get(userId) as any;
  if (!user || user.status !== 'active') {
    res.status(user ? 403 : 401).json({ error: user ? 'Account is inactive.' : 'Account profile not found.' });
    return false;
  }
  req.user = { userId: user.id, email: user.email, role: user.role, instituteId: user.institute_id };
  next();
  return true;
}

export function verifyToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authorization token required' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    attachDatabaseUser(req, res, next, decoded.userId);
  } catch {
    void firebaseAdminAuth.verifyIdToken(token)
      .then((decoded) => attachDatabaseUser(req, res, next, decoded.uid))
      .catch(() => res.status(401).json({ error: 'Invalid or expired token' }));
  }
}

export function verifyFirebaseToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Firebase ID token required.' });
    return;
  }
  void firebaseAdminAuth.verifyIdToken(authHeader.slice(7))
    .then((decoded) => {
      if (!decoded.uid || !decoded.email) {
        res.status(401).json({ error: 'Firebase account must have a verified email address.' });
        return;
      }
      req.firebaseUser = { uid: decoded.uid, email: decoded.email, emailVerified: Boolean(decoded.email_verified) };
      next();
    })
    .catch(() => res.status(401).json({ error: 'Invalid or expired Firebase ID token.' }));
}

export function verifyFirebaseTokenWhenPresent(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    next(); // Legacy local authentication remains available when Firebase is not configured or no token sent.
    return;
  }
  const token = authHeader.slice(7);
  void firebaseAdminAuth.verifyIdToken(token)
    .then((decoded) => {
      if (!decoded.uid || !decoded.email) {
        res.status(401).json({ error: 'Firebase account must have a verified email address.' });
        return;
      }
      req.firebaseUser = { uid: decoded.uid, email: decoded.email, emailVerified: Boolean(decoded.email_verified) };
      next();
    })
    .catch(() => {
      // If Firebase verification fails but a password is provided (local registration fallback or stale token),
      // allow local authentication to handle the request instead of failing with 401.
      if (req.body?.password) {
        next();
        return;
      }
      res.status(401).json({ error: 'Invalid or expired Firebase ID token.' });
    });
}

export function requireRole(roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({ error: `Access denied. Required role: ${roles.join(' or ')}` });
      return;
    }
    next();
  };
}

export function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      req.user = jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch {
      // ignore invalid token for optional auth
    }
  }
  next();
}

export async function verifySocketToken(token: string): Promise<JwtPayload> {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    const decoded = await firebaseAdminAuth.verifyIdToken(token);
    const user = db.prepare('SELECT id, email, role, institute_id FROM users WHERE id = ?').get(decoded.uid) as any;
    if (!user) throw new Error('Account profile not found.');
    return { userId: user.id, email: user.email, role: user.role, instituteId: user.institute_id };
  }
}

export { JWT_SECRET, JWT_EXPIRES_IN, REFRESH_EXPIRES_IN };

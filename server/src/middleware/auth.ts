import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import db from '../db/database';

const JWT_SECRET = process.env.JWT_SECRET || 'lumio_jwt_secret_2026_please_change_in_production';
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

export function verifyToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authorization token required' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
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

export { JWT_SECRET, JWT_EXPIRES_IN, REFRESH_EXPIRES_IN };

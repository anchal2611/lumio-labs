import { Response } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db/database';
import { AuthRequest } from '../middleware/auth';
import { createNotification, recordAudit } from './activityController';

export function listResources(req: AuthRequest, res: Response): void {
  const user = req.user!;
  if (user.role === 'student') {
    const resources = db.prepare(`SELECT r.*, uploader.name AS author_name, c.name AS class_name FROM resources r
      JOIN users uploader ON uploader.id = r.uploader_id LEFT JOIN classes c ON c.id = r.class_id
      WHERE (r.class_id IS NOT NULL AND EXISTS (SELECT 1 FROM class_enrollments ce WHERE ce.class_id = r.class_id AND ce.student_id = ?))
         OR (r.class_id IS NULL AND r.institute_id = ?)
      ORDER BY r.created_at DESC LIMIT 200`).all(user.userId, user.instituteId || '__no_institute__');
    res.json({ resources });
    return;
  }
  if (!user.instituteId) {
    res.status(403).json({ error: 'Your account must be linked to an institute to view shared resources.' });
    return;
  }
  const scope = user.role === 'teacher'
    ? 'AND (r.class_id IS NULL OR r.class_id IN (SELECT id FROM classes WHERE teacher_id = ?))'
    : '';
  const params = user.role === 'teacher' ? [user.instituteId, user.userId] : [user.instituteId];
  const resources = db.prepare(`SELECT r.*, uploader.name AS author_name, c.name AS class_name FROM resources r
    JOIN users uploader ON uploader.id = r.uploader_id LEFT JOIN classes c ON c.id = r.class_id
    WHERE r.institute_id = ? ${scope} ORDER BY r.created_at DESC LIMIT 200`).all(...params);
  res.json({ resources });
}

export function createResource(req: AuthRequest, res: Response): void {
  const instituteId = req.user!.instituteId;
  if (!instituteId) {
    res.status(403).json({ error: 'Admin must be associated with an institute.' });
    return;
  }
  const { title, description = '', category = 'reference', fileType = 'link', fileSize = '', downloadUrl } = req.body || {};
  const classId = typeof req.body?.classId === 'string' && req.body.classId.trim() ? req.body.classId.trim() : null;
  if (typeof title !== 'string' || !title.trim() || title.trim().length > 160) {
    res.status(400).json({ error: 'Resource title must be between 1 and 160 characters.' });
    return;
  }
  if (typeof description !== 'string' || description.length > 2000 || typeof category !== 'string' || category.length > 80 || typeof fileType !== 'string' || fileType.length > 30 || typeof fileSize !== 'string' || fileSize.length > 40) {
    res.status(400).json({ error: 'Description or resource metadata is too long.' });
    return;
  }
  if (typeof downloadUrl !== 'string' || downloadUrl.length > 2048) {
    res.status(400).json({ error: 'Resource URL must be 2048 characters or fewer.' });
    return;
  }
  let parsedUrl: URL;
  try { parsedUrl = new URL(downloadUrl); } catch { res.status(400).json({ error: 'Enter a valid resource URL.' }); return; }
  if (parsedUrl.protocol !== 'https:' || parsedUrl.username || parsedUrl.password) {
    res.status(400).json({ error: 'Resource URLs must use HTTPS and cannot contain embedded credentials.' });
    return;
  }
  if (classId && !db.prepare('SELECT id FROM classes WHERE id = ? AND institute_id = ?').get(classId, instituteId)) {
    res.status(400).json({ error: 'Choose a class from your institute.' });
    return;
  }
  const id = uuid();
  db.prepare(`INSERT INTO resources (id, institute_id, class_id, title, description, category, file_type, file_size, download_url, uploader_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(id, instituteId, classId, title.trim(), description.trim(), category.trim(), fileType.trim(), fileSize.trim(), parsedUrl.toString(), req.user!.userId);
  recordAudit(req, 'resource.created', 'resource', id, `Added shared resource "${title.trim()}".`);
  const students = classId
    ? db.prepare('SELECT student_id FROM class_enrollments WHERE class_id = ?').all(classId) as any[]
    : db.prepare("SELECT id AS student_id FROM users WHERE role = 'student' AND institute_id = ? AND status = 'active'").all(instituteId) as any[];
  for (const student of students) createNotification(student.student_id, 'resource', 'New learning resource', `${title.trim()} is available in the resource library.`, '/student/resources');
  res.status(201).json({ id, message: 'Resource added.' });
}

export function deleteResource(req: AuthRequest, res: Response): void {
  const resource = db.prepare('SELECT id, title FROM resources WHERE id = ? AND institute_id = ?').get(req.params.id, req.user!.instituteId) as any;
  if (!resource) {
    res.status(404).json({ error: 'Resource not found in your institute.' });
    return;
  }
  db.prepare('DELETE FROM resources WHERE id = ?').run(resource.id);
  recordAudit(req, 'resource.deleted', 'resource', resource.id, `Removed shared resource "${resource.title}".`);
  res.json({ message: 'Resource removed.' });
}

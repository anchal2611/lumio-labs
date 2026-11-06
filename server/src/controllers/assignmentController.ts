import { Response } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db/database';
import { AuthRequest } from '../middleware/auth';

// POST /api/assignments
export function createAssignment(req: AuthRequest, res: Response): void {
  try {
    const { labModuleId, classId, title, description, dueDate, maxMarks } = req.body;
    if (!labModuleId || !classId || !title) {
      res.status(400).json({ error: 'Lab module ID, class ID, and title are required.' });
      return;
    }

    // Verify teacher owns the class
    const cls = db.prepare('SELECT id FROM classes WHERE id = ? AND teacher_id = ?').get(classId, req.user!.userId);
    if (!cls) {
      res.status(403).json({ error: 'You do not own this class.' });
      return;
    }

    const id = uuid();
    db.prepare(`
      INSERT INTO assignments (id, lab_module_id, class_id, title, description, due_date, max_marks)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, labModuleId, classId, title.trim(), description || null, dueDate || null, maxMarks || 100);

    const assignment = db.prepare('SELECT * FROM assignments WHERE id = ?').get(id);
    res.status(201).json(assignment);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to create assignment.' });
  }
}

// GET /api/assignments
export function listAssignments(req: AuthRequest, res: Response): void {
  const user = req.user!;
  const { classId } = req.query as any;

  let assignments: any[];
  if (user.role === 'teacher' || user.role === 'admin') {
    let query = `
      SELECT a.*, c.name as class_name, lm.title as lab_title,
        (SELECT COUNT(*) FROM submissions WHERE assignment_id = a.id) as submission_count
      FROM assignments a
      JOIN classes c ON c.id = a.class_id
      JOIN lab_modules lm ON lm.id = a.lab_module_id
      WHERE c.teacher_id = ?
    `;
    const params: any[] = [user.userId];
    if (classId) { query += ' AND a.class_id = ?'; params.push(classId); }
    query += ' ORDER BY a.created_at DESC';
    assignments = db.prepare(query).all(...params);
  } else {
    // Students: get assignments from enrolled classes
    let query = `
      SELECT a.*, c.name as class_name, lm.title as lab_title,
        s.id as submission_id, s.status as submission_status, s.marks, s.submitted_at
      FROM assignments a
      JOIN classes c ON c.id = a.class_id
      JOIN lab_modules lm ON lm.id = a.lab_module_id
      JOIN class_enrollments ce ON ce.class_id = a.class_id
      LEFT JOIN submissions s ON s.assignment_id = a.id AND s.student_id = ?
      WHERE ce.student_id = ?
    `;
    const params: any[] = [user.userId, user.userId];
    if (classId) { query += ' AND a.class_id = ?'; params.push(classId); }
    query += ' ORDER BY a.created_at DESC';
    assignments = db.prepare(query).all(...params);
  }

  res.json({ assignments });
}

// POST /api/assignments/:id/submit
export function submitAssignment(req: AuthRequest, res: Response): void {
  try {
    const { id } = req.params;
    const { code, notes } = req.body;

    const assignment = db.prepare('SELECT * FROM assignments WHERE id = ?').get(id) as any;
    if (!assignment) {
      res.status(404).json({ error: 'Assignment not found.' });
      return;
    }

    // Check student is enrolled
    const enrolled = db.prepare('SELECT 1 FROM class_enrollments WHERE class_id = ? AND student_id = ?').get(assignment.class_id, req.user!.userId);
    if (!enrolled) {
      res.status(403).json({ error: 'You are not enrolled in this class.' });
      return;
    }

    const submissionId = uuid();
    db.prepare(`
      INSERT INTO submissions (id, assignment_id, student_id, code, notes, status)
      VALUES (?, ?, ?, ?, ?, 'submitted')
      ON CONFLICT(assignment_id, student_id) DO UPDATE SET
        code = excluded.code,
        notes = excluded.notes,
        status = 'submitted',
        submitted_at = datetime('now')
    `).run(submissionId, id, req.user!.userId, code || null, notes || null);

    res.json({ message: 'Assignment submitted successfully.', submissionId });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to submit assignment.' });
  }
}

// GET /api/assignments/:id/submissions — teacher only
export function getSubmissions(req: AuthRequest, res: Response): void {
  const { id } = req.params;

  const assignment = db.prepare(`
    SELECT a.*, c.teacher_id FROM assignments a JOIN classes c ON c.id = a.class_id WHERE a.id = ?
  `).get(id) as any;

  if (!assignment) {
    res.status(404).json({ error: 'Assignment not found.' });
    return;
  }

  if (assignment.teacher_id !== req.user!.userId && req.user!.role !== 'admin') {
    res.status(403).json({ error: 'Access denied.' });
    return;
  }

  const submissions = db.prepare(`
    SELECT s.*, u.name as student_name, u.email as student_email,
           sp.roll_number, sp.branch
    FROM submissions s
    JOIN users u ON u.id = s.student_id
    LEFT JOIN student_profiles sp ON sp.user_id = s.student_id
    WHERE s.assignment_id = ?
    ORDER BY s.submitted_at DESC
  `).all(id);

  res.json({ assignment, submissions });
}

// PUT /api/assignments/:id/submissions/:sid/grade — teacher only
export function gradeSubmission(req: AuthRequest, res: Response): void {
  const { id, sid } = req.params;
  const { marks, feedback } = req.body;

  if (marks === undefined) {
    res.status(400).json({ error: 'Marks are required.' });
    return;
  }

  const assignment = db.prepare(`
    SELECT a.max_marks, c.teacher_id FROM assignments a JOIN classes c ON c.id = a.class_id WHERE a.id = ?
  `).get(id) as any;

  if (!assignment) {
    res.status(404).json({ error: 'Assignment not found.' });
    return;
  }

  if (assignment.teacher_id !== req.user!.userId) {
    res.status(403).json({ error: 'Access denied.' });
    return;
  }

  if (marks > assignment.max_marks || marks < 0) {
    res.status(400).json({ error: `Marks must be between 0 and ${assignment.max_marks}.` });
    return;
  }

  db.prepare(`
    UPDATE submissions SET marks = ?, feedback = ?, status = 'graded', graded_at = datetime('now')
    WHERE id = ? AND assignment_id = ?
  `).run(marks, feedback || null, sid, id);

  res.json({ message: 'Submission graded successfully.' });
}

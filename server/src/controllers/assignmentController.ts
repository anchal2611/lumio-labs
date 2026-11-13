import { Response } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db/database';
import { AuthRequest } from '../middleware/auth';
import { createNotification, recordAudit } from './activityController';
import { syncAssignmentToFirestore, syncSubmissionToFirestore } from '../services/firebaseService';

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

    const lab = db.prepare('SELECT id, class_id FROM lab_modules WHERE id = ? AND teacher_id = ?').get(labModuleId, req.user!.userId) as any;
    if (!lab || (lab.class_id && lab.class_id !== classId)) {
      res.status(400).json({ error: 'Choose one of your labs assigned to this class.' });
      return;
    }
    if (typeof title !== 'string' || !title.trim() || title.trim().length > 160) {
      res.status(400).json({ error: 'Assignment title must be between 1 and 160 characters.' });
      return;
    }
    if (description !== undefined && description !== null && (typeof description !== 'string' || description.length > 4000)) {
      res.status(400).json({ error: 'Assignment description must be 4000 characters or fewer.' });
      return;
    }
    if (dueDate && (typeof dueDate !== 'string' || Number.isNaN(Date.parse(dueDate)))) {
      res.status(400).json({ error: 'Due date must be a valid date.' });
      return;
    }
    const marks = Number(maxMarks ?? 100);
    if (!Number.isFinite(marks) || marks < 1 || marks > 10000) {
      res.status(400).json({ error: 'Maximum marks must be between 1 and 10000.' });
      return;
    }

    const id = uuid();
    db.prepare(`
      INSERT INTO assignments (id, lab_module_id, class_id, title, description, due_date, max_marks)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, labModuleId, classId, title.trim(), description || null, dueDate || null, marks);

    const assignment = db.prepare('SELECT * FROM assignments WHERE id = ?').get(id) as any;
    void syncAssignmentToFirestore({
      id,
      class_id: classId,
      lab_module_id: labModuleId,
      title: title.trim(),
      description: description || null,
      due_date: dueDate || null,
      max_marks: marks,
    });
    const students = db.prepare('SELECT student_id FROM class_enrollments WHERE class_id = ?').all(classId) as any[];
    for (const student of students) createNotification(student.student_id, 'assignment', 'New assignment', `${title.trim()} is available for submission.`, `/student/assignments`);
    recordAudit(req, 'assignment.created', 'assignment', id, `Created assignment "${title.trim()}" for class ${classId}.`);
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
      SELECT a.*, c.name as class_name, lm.title as lab_title, u.name as teacher_name,
        (SELECT COUNT(*) FROM submissions WHERE assignment_id = a.id) as submission_count
      FROM assignments a
      JOIN classes c ON c.id = a.class_id
      JOIN lab_modules lm ON lm.id = a.lab_module_id
      JOIN users u ON u.id = c.teacher_id
      WHERE c.teacher_id = ?
    `;
    const params: any[] = [user.userId];
    if (user.role === 'admin') {
      if (!user.instituteId) {
        res.status(403).json({ error: 'Admin must be associated with an institute.' });
        return;
      }
      query = query.replace('WHERE c.teacher_id = ?', 'WHERE c.institute_id = ?');
      params[0] = user.instituteId;
    }
    if (classId) { query += ' AND a.class_id = ?'; params.push(classId); }
    query += ' ORDER BY a.created_at DESC';
    assignments = db.prepare(query).all(...params);
  } else {
    // Students: get assignments from enrolled classes
    let query = `
      SELECT a.*, c.name as class_name, lm.title as lab_title,
        s.id as submission_id, s.status as submission_status, s.marks, s.feedback as submission_feedback, s.submitted_at, s.graded_at
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
        submitted_at = datetime('now'),
        marks = NULL,
        feedback = NULL,
        graded_at = NULL
    `).run(submissionId, id, req.user!.userId, code || null, notes || null);

    const saved = db.prepare('SELECT id FROM submissions WHERE assignment_id = ? AND student_id = ?').get(id, req.user!.userId) as any;
    res.json({ message: 'Assignment submitted successfully.', submissionId: saved.id });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to submit assignment.' });
  }
}

// GET /api/assignments/:id/submissions — teacher only
export function getSubmissions(req: AuthRequest, res: Response): void {
  const { id } = req.params;

  const assignment = db.prepare(`
    SELECT a.*, c.teacher_id, c.institute_id FROM assignments a JOIN classes c ON c.id = a.class_id WHERE a.id = ?
  `).get(id) as any;

  if (!assignment) {
    res.status(404).json({ error: 'Assignment not found.' });
    return;
  }

  if (assignment.teacher_id !== req.user!.userId && (req.user!.role !== 'admin' || !req.user!.instituteId || assignment.institute_id !== req.user!.instituteId)) {
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

  if (typeof marks !== 'number' || !Number.isFinite(marks)) {
    res.status(400).json({ error: 'A valid numeric score is required.' });
    return;
  }

  const assignment = db.prepare(`
    SELECT a.max_marks, c.teacher_id, c.institute_id FROM assignments a JOIN classes c ON c.id = a.class_id WHERE a.id = ?
  `).get(id) as any;

  if (!assignment) {
    res.status(404).json({ error: 'Assignment not found.' });
    return;
  }

  if (assignment.teacher_id !== req.user!.userId && (req.user!.role !== 'admin' || !req.user!.instituteId || assignment.institute_id !== req.user!.instituteId)) {
    res.status(403).json({ error: 'Access denied.' });
    return;
  }

  if (marks > assignment.max_marks || marks < 0) {
    res.status(400).json({ error: `Marks must be between 0 and ${assignment.max_marks}.` });
    return;
  }
  if (feedback !== undefined && feedback !== null && (typeof feedback !== 'string' || feedback.length > 4000)) {
    res.status(400).json({ error: 'Feedback must be 4000 characters or fewer.' });
    return;
  }

  const result = db.prepare(`
    UPDATE submissions SET marks = ?, feedback = ?, status = 'graded', graded_at = datetime('now')
    WHERE id = ? AND assignment_id = ?
  `).run(marks, feedback || null, sid, id);

  if (result.changes === 0) {
    res.status(404).json({ error: 'Submission not found for this assignment.' });
    return;
  }

  void syncSubmissionToFirestore({
    id: sid,
    assignment_id: id,
    student_id: (db.prepare('SELECT student_id FROM submissions WHERE id = ?').get(sid) as any)?.student_id || '',
    status: 'graded',
    marks,
    feedback: feedback || null,
    graded_at: new Date().toISOString(),
  });
  const student = db.prepare('SELECT student_id FROM submissions WHERE id = ?').get(sid) as any;
  if (student) createNotification(student.student_id, 'submission_graded', 'Submission graded', `Your submission received ${marks}/${assignment.max_marks}${feedback ? `: ${String(feedback).slice(0, 240)}` : '.'}`, '/student/assignments');
  recordAudit(req, 'submission.graded', 'submission', sid, `Graded submission ${sid} with ${marks}/${assignment.max_marks}.`);

  res.json({ message: 'Submission graded successfully.' });
}

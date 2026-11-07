import { Response } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db/database';
import { AuthRequest } from '../middleware/auth';

// POST /api/labs
export function createLab(req: AuthRequest, res: Response): void {
  try {
    const { title, description, category, difficulty, language, classId, exercises, isPublished } = req.body;
    if (!title) {
      res.status(400).json({ error: 'Lab title is required.' });
      return;
    }

    // Validate class ownership if classId provided
    if (classId) {
      const cls = db.prepare('SELECT id FROM classes WHERE id = ? AND teacher_id = ?').get(classId, req.user!.userId);
      if (!cls) {
        res.status(403).json({ error: 'You do not own this class.' });
        return;
      }
    }

    const labId = uuid();
    // Add ids to exercises if missing
    const exercisesWithIds = (exercises || []).map((ex: any, i: number) => ({
      id: ex.id || uuid(),
      order: ex.order || i + 1,
      title: ex.title || `Exercise ${i + 1}`,
      description: ex.description || '',
      starterCode: ex.starterCode || '',
      expectedOutput: ex.expectedOutput || '',
      hints: ex.hints || [],
      points: ex.points || 10,
    }));

    db.prepare(`
      INSERT INTO lab_modules (id, title, description, category, difficulty, language, teacher_id, class_id, exercises, is_published)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      labId,
      title.trim(),
      description || null,
      category || 'programming',
      difficulty || 'beginner',
      language || 'python',
      req.user!.userId,
      classId || null,
      JSON.stringify(exercisesWithIds),
      isPublished ? 1 : 0,
    );

    const lab = db.prepare('SELECT * FROM lab_modules WHERE id = ?').get(labId) as any;
    res.status(201).json({ ...lab, exercises: exercisesWithIds });
  } catch (err: any) {
    console.error('Create lab error:', err);
    res.status(500).json({ error: 'Failed to create lab module.' });
  }
}

// GET /api/labs
export function listLabs(req: AuthRequest, res: Response): void {
  const user = req.user!;
  const { classId } = req.query as any;

  let labs: any[];
  if (user.role === 'teacher' || user.role === 'admin') {
    let query = 'SELECT lm.*, u.name as teacher_name FROM lab_modules lm JOIN users u ON u.id = lm.teacher_id WHERE ';
    const params: any[] = [];
    if (user.role === 'admin') {
      if (!user.instituteId) {
        res.status(403).json({ error: 'Admin must be associated with an institute.' });
        return;
      }
      query += 'u.institute_id = ?';
      params.push(user.instituteId);
    } else {
      query += 'lm.teacher_id = ?';
      params.push(user.userId);
    }
    if (classId) {
      query += ' AND lm.class_id = ?';
      params.push(classId);
    }
    query += ' ORDER BY lm.created_at DESC';
    labs = db.prepare(query).all(...params);
  } else {
    // Students: get published labs from enrolled classes
    let query = `
      SELECT lm.*, u.name as teacher_name 
      FROM lab_modules lm
      JOIN users u ON u.id = lm.teacher_id
      JOIN classes c ON c.id = lm.class_id
      JOIN class_enrollments ce ON ce.class_id = c.id
      WHERE ce.student_id = ? AND lm.is_published = 1
    `;
    const params: any[] = [user.userId];
    if (classId) {
      query += ' AND lm.class_id = ?';
      params.push(classId);
    }
    query += ' ORDER BY lm.created_at DESC';
    labs = db.prepare(query).all(...params);
  }

  // Parse exercises JSON
  labs = labs.map((lab: any) => {
    try { return { ...lab, exercises: JSON.parse(lab.exercises || '[]') }; }
    catch { return { ...lab, exercises: [] }; }
  });

  res.json({ labs });
}

// GET /api/labs/:id
export function getLab(req: AuthRequest, res: Response): void {
  const { id } = req.params;
  const lab = db.prepare(`
    SELECT lm.*, u.name as teacher_name, u.email as teacher_email, u.institute_id as teacher_institute_id
    FROM lab_modules lm
    JOIN users u ON u.id = lm.teacher_id
    WHERE lm.id = ?
  `).get(id) as any;

  if (!lab) {
    res.status(404).json({ error: 'Lab module not found.' });
    return;
  }

  // Access check for students
  if (req.user!.role === 'student') {
    if (!lab.is_published) {
      res.status(403).json({ error: 'This lab is not yet published.' });
      return;
    }
    if (lab.class_id) {
      const enrolled = db.prepare('SELECT 1 FROM class_enrollments WHERE class_id = ? AND student_id = ?').get(lab.class_id, req.user!.userId);
      if (!enrolled) {
        res.status(403).json({ error: 'You are not enrolled in the class this lab belongs to.' });
        return;
      }
    }
  } else if (req.user!.role === 'teacher' && lab.teacher_id !== req.user!.userId) {
    res.status(403).json({ error: 'You do not have access to this lab.' });
    return;
  } else if (req.user!.role === 'admin' && (!req.user!.instituteId || lab.teacher_institute_id !== req.user!.instituteId)) {
    res.status(403).json({ error: 'You do not have access to this lab.' });
    return;
  }

  let exercises: any[] = [];
  try { exercises = JSON.parse(lab.exercises || '[]'); } catch { }

  const cls = lab.class_id ? db.prepare('SELECT id, name, subject FROM classes WHERE id = ?').get(lab.class_id) : null;

  res.json({ ...lab, exercises, class: cls });
}

// PUT /api/labs/:id
export function updateLab(req: AuthRequest, res: Response): void {
  const { id } = req.params;
  const lab = db.prepare('SELECT * FROM lab_modules WHERE id = ? AND teacher_id = ?').get(id, req.user!.userId) as any;
  if (!lab) {
    res.status(404).json({ error: 'Lab not found or you do not own it.' });
    return;
  }

  const { title, description, category, difficulty, language, classId, exercises, isPublished } = req.body;
  const nextClassId = classId === '' ? null : (classId ?? lab.class_id);
  if (nextClassId && nextClassId !== lab.class_id) {
    const cls = db.prepare('SELECT id FROM classes WHERE id = ? AND teacher_id = ?').get(nextClassId, req.user!.userId);
    if (!cls) {
      res.status(403).json({ error: 'You do not own the selected class.' });
      return;
    }
  }
  const exercisesWithIds = exercises
    ? exercises.map((ex: any, i: number) => ({ id: ex.id || uuid(), order: ex.order || i + 1, ...ex }))
    : JSON.parse(lab.exercises || '[]');

  db.prepare(`
    UPDATE lab_modules SET title = ?, description = ?, category = ?, difficulty = ?, language = ?, class_id = ?, exercises = ?, is_published = ?
    WHERE id = ?
  `).run(
    title || lab.title,
    description ?? lab.description,
    category || lab.category,
    difficulty || lab.difficulty,
    language || lab.language,
    nextClassId,
    JSON.stringify(exercisesWithIds),
    isPublished !== undefined ? (isPublished ? 1 : 0) : lab.is_published,
    id,
  );

  const updated = db.prepare('SELECT * FROM lab_modules WHERE id = ?').get(id) as any;
  res.json({ ...updated, exercises: exercisesWithIds });
}

// DELETE /api/labs/:id
export function deleteLab(req: AuthRequest, res: Response): void {
  const { id } = req.params;
  const lab = db.prepare('SELECT id FROM lab_modules WHERE id = ? AND teacher_id = ?').get(id, req.user!.userId);
  if (!lab) {
    res.status(404).json({ error: 'Lab not found or you do not own it.' });
    return;
  }
  const linkedAssignment = db.prepare('SELECT id FROM assignments WHERE lab_module_id = ? LIMIT 1').get(id);
  if (linkedAssignment) {
    res.status(409).json({ error: 'This lab is linked to an assignment. Unpublish it instead of deleting it.' });
    return;
  }
  db.prepare('DELETE FROM lab_modules WHERE id = ?').run(id);
  res.json({ message: 'Lab module deleted.' });
}

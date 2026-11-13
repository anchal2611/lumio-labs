import { Response } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../db/database';
import { AuthRequest } from '../middleware/auth';
import { createNotification, recordAudit } from './activityController';

function normalizeExercises(input: unknown): any[] | null {
  if (input === undefined) return [];
  if (!Array.isArray(input) || input.length > 100 || input.some((exercise) => !exercise || typeof exercise !== 'object' || Array.isArray(exercise))) return null;
  const normalized: any[] = [];
  for (const [index, exercise] of input.entries()) {
    if ([exercise.title, exercise.description, exercise.starterCode, exercise.expectedOutput].some((value) => value !== undefined && value !== null && typeof value !== 'string')) return null;
    if ([exercise.title, exercise.description, exercise.starterCode, exercise.expectedOutput].some((value) => typeof value === 'string' && value.length > 50_000)) return null;
    if (exercise.hints !== undefined && (!Array.isArray(exercise.hints) || exercise.hints.length > 30 || exercise.hints.some((hint: unknown) => typeof hint !== 'string' || hint.length > 1000))) return null;
    const points = exercise.points === undefined ? 10 : Number(exercise.points);
    if (!Number.isFinite(points) || points < 0 || points > 10000) return null;
    normalized.push({
      id: typeof exercise.id === 'string' && exercise.id.length <= 80 ? exercise.id : uuid(),
      order: Number.isFinite(Number(exercise.order)) && Number(exercise.order) > 0 ? Number(exercise.order) : index + 1,
      title: typeof exercise.title === 'string' && exercise.title.trim() ? exercise.title.trim().slice(0, 160) : `Exercise ${index + 1}`,
      description: exercise.description || '',
      starterCode: exercise.starterCode || '',
      expectedOutput: exercise.expectedOutput || '',
      hints: exercise.hints || [],
      points,
    });
  }
  return normalized;
}

// POST /api/labs
export function createLab(req: AuthRequest, res: Response): void {
  try {
    const { title, description, category, difficulty, language, classId, exercises, isPublished } = req.body;
    if (typeof title !== 'string' || !title.trim() || title.trim().length > 160) {
      res.status(400).json({ error: 'Lab title is required.' });
      return;
    }
    if (req.user!.role === 'admin' && !req.user!.instituteId) {
      res.status(403).json({ error: 'Admin must be associated with an institute.' });
      return;
    }
    if (description !== undefined && description !== null && (typeof description !== 'string' || description.length > 4000)) {
      res.status(400).json({ error: 'Lab description must be 4000 characters or fewer.' });
      return;
    }
    if (category !== undefined && (typeof category !== 'string' || category.length > 80) || difficulty !== undefined && !['beginner', 'intermediate', 'advanced'].includes(difficulty) || language !== undefined && (typeof language !== 'string' || language.length > 40)) {
      res.status(400).json({ error: 'Check the lab category, difficulty, and language values.' });
      return;
    }
    if (classId !== undefined && classId !== null && typeof classId !== 'string') { res.status(400).json({ error: 'Choose a valid class.' }); return; }
    if (isPublished !== undefined && typeof isPublished !== 'boolean') { res.status(400).json({ error: 'Lab visibility must be true or false.' }); return; }
    const exercisesWithIds = normalizeExercises(exercises);
    if (!exercisesWithIds) { res.status(400).json({ error: 'Exercise fields are invalid or exceed the allowed limits.' }); return; }

    let ownerId = req.user!.userId;
    // Admin-created labs must be attached to a class so enrolled students can discover them.
    if (req.user!.role === 'admin' && !classId) {
      res.status(400).json({ error: 'Choose an institute class for this lab.' });
      return;
    }
    if (classId) {
      const cls = req.user!.role === 'admin'
        ? db.prepare('SELECT id, teacher_id FROM classes WHERE id = ? AND institute_id = ?').get(classId, req.user!.instituteId) as any
        : db.prepare('SELECT id, teacher_id FROM classes WHERE id = ? AND teacher_id = ?').get(classId, req.user!.userId) as any;
      if (!cls) {
        res.status(403).json({ error: req.user!.role === 'admin' ? 'Choose a class in your institute.' : 'You do not own this class.' });
        return;
      }
      if (req.user!.role === 'admin') ownerId = cls.teacher_id;
    }

    const labId = uuid();
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
      ownerId,
      classId || null,
      JSON.stringify(exercisesWithIds),
      isPublished ? 1 : 0,
    );

    const lab = db.prepare('SELECT * FROM lab_modules WHERE id = ?').get(labId) as any;
    recordAudit(req, 'lab.created', 'lab', labId, `Created ${isPublished ? 'published' : 'draft'} lab "${title.trim()}"${classId ? ` for class ${classId}` : ''}.`);
    if (isPublished && classId) {
      const students = db.prepare('SELECT student_id FROM class_enrollments WHERE class_id = ?').all(classId) as any[];
      for (const student of students) createNotification(student.student_id, 'lab_published', 'New lab available', `${title.trim()} is ready in your class.`, `/student/labs`);
    }
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
    // Students: get published labs from enrolled classes, institute, or open virtual labs
    let query = `
      SELECT DISTINCT lm.*, u.name as teacher_name, c.name as class_name 
      FROM lab_modules lm
      JOIN users u ON u.id = lm.teacher_id
      LEFT JOIN classes c ON c.id = lm.class_id
      LEFT JOIN class_enrollments ce ON ce.class_id = c.id AND ce.student_id = ?
      WHERE lm.is_published = 1 AND (
        ce.student_id IS NOT NULL 
        OR lm.class_id IS NULL 
        OR (u.institute_id = ? AND ? IS NOT NULL)
      )
    `;
    const params: any[] = [user.userId, user.instituteId, user.instituteId];
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
      const isSameInstitute = req.user!.instituteId && lab.teacher_institute_id === req.user!.instituteId;
      if (!enrolled && !isSameInstitute) {
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
  const lab = db.prepare(`SELECT lm.*, owner.institute_id AS owner_institute_id, c.institute_id AS class_institute_id
    FROM lab_modules lm JOIN users owner ON owner.id = lm.teacher_id LEFT JOIN classes c ON c.id = lm.class_id WHERE lm.id = ?`).get(id) as any;
  if (!lab) {
    res.status(404).json({ error: 'Lab not found or you do not own it.' });
    return;
  }
  if (req.user!.role === 'teacher' && lab.teacher_id !== req.user!.userId) {
    res.status(404).json({ error: 'Lab not found or you do not own it.' });
    return;
  }
  if (req.user!.role === 'admin' && (!req.user!.instituteId || (lab.owner_institute_id !== req.user!.instituteId && lab.class_institute_id !== req.user!.instituteId))) {
    res.status(404).json({ error: 'Lab not found in your institute.' });
    return;
  }

  const { title, description, category, difficulty, language, classId, exercises, isPublished } = req.body;
  if (title !== undefined && (typeof title !== 'string' || !title.trim() || title.trim().length > 160) || description !== undefined && description !== null && (typeof description !== 'string' || description.length > 4000) || category !== undefined && (typeof category !== 'string' || category.length > 80) || difficulty !== undefined && !['beginner', 'intermediate', 'advanced'].includes(difficulty) || language !== undefined && (typeof language !== 'string' || language.length > 40)) {
    res.status(400).json({ error: 'Check the lab fields and ensure they meet the allowed limits.' });
    return;
  }
  if (classId !== undefined && classId !== null && typeof classId !== 'string') { res.status(400).json({ error: 'Choose a valid class.' }); return; }
  if (isPublished !== undefined && typeof isPublished !== 'boolean') { res.status(400).json({ error: 'Lab visibility must be true or false.' }); return; }
  const nextClassId = classId === '' ? null : (classId ?? lab.class_id);
  if (req.user!.role === 'admin' && !nextClassId) {
    res.status(400).json({ error: 'Institute labs must remain assigned to a class.' });
    return;
  }
  let nextTeacherId = lab.teacher_id;
  if (nextClassId && nextClassId !== lab.class_id) {
    const cls = req.user!.role === 'admin'
      ? db.prepare('SELECT id, teacher_id FROM classes WHERE id = ? AND institute_id = ?').get(nextClassId, req.user!.instituteId) as any
      : db.prepare('SELECT id, teacher_id FROM classes WHERE id = ? AND teacher_id = ?').get(nextClassId, req.user!.userId) as any;
    if (!cls) {
      res.status(403).json({ error: req.user!.role === 'admin' ? 'Choose a class in your institute.' : 'You do not own the selected class.' });
      return;
    }
    if (req.user!.role === 'admin') nextTeacherId = cls.teacher_id;
  }
  const exercisesWithIds = exercises !== undefined ? normalizeExercises(exercises) : null;
  if (exercises !== undefined && !exercisesWithIds) {
    res.status(400).json({ error: 'Exercise fields are invalid or exceed the allowed limits.' });
    return;
  }
  const finalExercises = exercises !== undefined ? exercisesWithIds! : JSON.parse(lab.exercises || '[]');

  db.prepare(`
    UPDATE lab_modules SET title = ?, description = ?, category = ?, difficulty = ?, language = ?, class_id = ?, teacher_id = ?, exercises = ?, is_published = ?
    WHERE id = ?
  `).run(
    typeof title === 'string' && title.trim() ? title.trim().slice(0, 160) : lab.title,
    description ?? lab.description,
    category || lab.category,
    difficulty || lab.difficulty,
    language || lab.language,
    nextClassId,
    nextTeacherId,
    JSON.stringify(finalExercises),
    isPublished !== undefined ? (isPublished ? 1 : 0) : lab.is_published,
    id,
  );

  const updated = db.prepare('SELECT * FROM lab_modules WHERE id = ?').get(id) as any;
  recordAudit(req, 'lab.updated', 'lab', id, `Updated lab "${updated.title}".`);
  if (!lab.is_published && updated.is_published && updated.class_id) {
    const students = db.prepare('SELECT student_id FROM class_enrollments WHERE class_id = ?').all(updated.class_id) as any[];
    for (const student of students) createNotification(student.student_id, 'lab_published', 'New lab available', `${updated.title} is ready in your class.`, `/student/labs`);
  }
  res.json({ ...updated, exercises: finalExercises });
}

// DELETE /api/labs/:id
export function deleteLab(req: AuthRequest, res: Response): void {
  const { id } = req.params;
  const lab = db.prepare(`SELECT lm.id, lm.title, owner.institute_id AS owner_institute_id, c.institute_id AS class_institute_id
    FROM lab_modules lm JOIN users owner ON owner.id = lm.teacher_id LEFT JOIN classes c ON c.id = lm.class_id WHERE lm.id = ?`).get(id) as any;
  if (!lab) {
    res.status(404).json({ error: 'Lab not found or you do not own it.' });
    return;
  }
  if (req.user!.role === 'teacher' && db.prepare('SELECT id FROM lab_modules WHERE id = ? AND teacher_id = ?').get(id, req.user!.userId) === undefined) {
    res.status(404).json({ error: 'Lab not found or you do not own it.' });
    return;
  }
  if (req.user!.role === 'admin' && (!req.user!.instituteId || (lab.owner_institute_id !== req.user!.instituteId && lab.class_institute_id !== req.user!.instituteId))) {
    res.status(404).json({ error: 'Lab not found in your institute.' });
    return;
  }
  const linkedAssignment = db.prepare('SELECT id FROM assignments WHERE lab_module_id = ? LIMIT 1').get(id);
  if (linkedAssignment) {
    res.status(409).json({ error: 'This lab is linked to an assignment. Unpublish it instead of deleting it.' });
    return;
  }
  db.prepare('DELETE FROM lab_modules WHERE id = ?').run(id);
  recordAudit(req, 'lab.deleted', 'lab', id, `Deleted lab "${lab.title}".`);
  res.json({ message: 'Lab module deleted.' });
}

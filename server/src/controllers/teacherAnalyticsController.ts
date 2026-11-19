import { Response } from 'express';
import db from '../db/database';
import { AuthRequest } from '../middleware/auth';

export function getTeacherAnalytics(req: AuthRequest, res: Response): void {
  const teacherId = req.user!.userId;

  const summary = db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM classes WHERE teacher_id = ?) AS class_count,
      (SELECT COUNT(DISTINCT ce.student_id) FROM class_enrollments ce
        JOIN classes c ON c.id = ce.class_id WHERE c.teacher_id = ?) AS student_count,
      (SELECT COUNT(*) FROM assignments a JOIN classes c ON c.id = a.class_id
        WHERE c.teacher_id = ?) AS assignment_count,
      (SELECT COUNT(*) FROM submissions s JOIN assignments a ON a.id = s.assignment_id
        JOIN classes c ON c.id = a.class_id WHERE c.teacher_id = ?) AS submission_count,
      (SELECT COUNT(*) FROM submissions s JOIN assignments a ON a.id = s.assignment_id
        JOIN classes c ON c.id = a.class_id WHERE c.teacher_id = ? AND s.status = 'graded') AS graded_count,
      (SELECT AVG(s.marks * 100.0 / NULLIF(a.max_marks, 0)) FROM submissions s
        JOIN assignments a ON a.id = s.assignment_id JOIN classes c ON c.id = a.class_id
        WHERE c.teacher_id = ? AND s.status = 'graded') AS average_score,
      (SELECT COUNT(*) FROM submissions s JOIN assignments a ON a.id = s.assignment_id
        JOIN classes c ON c.id = a.class_id WHERE c.teacher_id = ? AND a.due_date IS NOT NULL
        AND strftime('%s', s.submitted_at) <= strftime('%s', a.due_date)) AS on_time_count,
      (SELECT COUNT(*) FROM submissions s JOIN assignments a ON a.id = s.assignment_id
        JOIN classes c ON c.id = a.class_id WHERE c.teacher_id = ? AND a.due_date IS NOT NULL) AS due_date_submission_count
  `).get(teacherId, teacherId, teacherId, teacherId, teacherId, teacherId, teacherId, teacherId) as any;

  const labs = db.prepare(`
    SELECT lm.id, lm.title,
      COUNT(DISTINCT a.id) AS assignment_count,
      COUNT(DISTINCT s.id) AS submission_count,
      COUNT(DISTINCT CASE WHEN s.status = 'graded' THEN s.id END) AS graded_count,
      AVG(CASE WHEN s.status = 'graded' THEN s.marks * 100.0 / NULLIF(a.max_marks, 0) END) AS average_score,
      SUM(CASE WHEN a.due_date IS NOT NULL AND s.id IS NOT NULL
        AND strftime('%s', s.submitted_at) <= strftime('%s', a.due_date) THEN 1 ELSE 0 END) AS on_time_count,
      SUM(CASE WHEN a.due_date IS NOT NULL AND s.id IS NOT NULL THEN 1 ELSE 0 END) AS due_date_submission_count
    FROM lab_modules lm
    JOIN assignments a ON a.lab_module_id = lm.id
    JOIN classes c ON c.id = a.class_id
    LEFT JOIN submissions s ON s.assignment_id = a.id
    WHERE c.teacher_id = ?
    GROUP BY lm.id, lm.title
    ORDER BY lm.title COLLATE NOCASE
  `).all(teacherId);

  res.json({ summary, labs });
}

import { Router } from 'express';
import { executeCodeHandler } from '../controllers/executionController';
import { verifyToken, verifyFirebaseTokenWhenPresent, requireRole, AuthRequest } from '../middleware/auth';

// Auth
import { register, login, logout, refresh, me, checkDomain } from '../controllers/authController';

// Institutes
import { registerInstitute, getMyInstitute, updateDomains, getInstituteUsers } from '../controllers/instituteController';

// Admin
import { createTeacher, getTeachers, getStudents, updateUserStatus, getStats } from '../controllers/adminController';

// Classes
import { createClass, listClasses, joinClass, getClass, getClassStudents, deleteClass, regenerateCode } from '../controllers/classController';

// Labs
import { createLab, listLabs, getLab, updateLab, deleteLab } from '../controllers/labController';

// Assignments
import { createAssignment, listAssignments, submitAssignment, getSubmissions, gradeSubmission } from '../controllers/assignmentController';

// Collab
import { createSession, listSessions, getSession, endSession } from '../controllers/collabController';

export const apiRouter = Router();

// ─── Health ──────────────────────────────────────────
apiRouter.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'LUMIO Platform API v2', timestamp: new Date().toISOString(), version: '2.0.0' });
});

// ─── Code Execution ──────────────────────────────────
apiRouter.post('/execute', verifyToken, requireRole(['student', 'teacher']), executeCodeHandler as any);

// ─── Auth ─────────────────────────────────────────────
apiRouter.post('/auth/register', verifyFirebaseTokenWhenPresent, register as any);
apiRouter.post('/auth/login', login);
apiRouter.post('/auth/logout', verifyToken, logout as any);
apiRouter.post('/auth/refresh', refresh);
apiRouter.get('/auth/me', verifyToken, me as any);
apiRouter.get('/auth/check-domain', checkDomain);

// ─── Institute Registration (public) ─────────────────
apiRouter.post('/institutes/register', registerInstitute);

// ─── Institute Management (admin only) ───────────────
apiRouter.get('/institutes/me', verifyToken, requireRole(['admin']), getMyInstitute as any);
apiRouter.put('/institutes/me/domains', verifyToken, requireRole(['admin']), updateDomains as any);
apiRouter.get('/institutes/me/users', verifyToken, requireRole(['admin']), getInstituteUsers as any);

// ─── Admin ────────────────────────────────────────────
apiRouter.post('/admin/teachers', verifyToken, requireRole(['admin']), createTeacher as any);
apiRouter.get('/admin/teachers', verifyToken, requireRole(['admin']), getTeachers as any);
apiRouter.get('/admin/students', verifyToken, requireRole(['admin']), getStudents as any);
apiRouter.patch('/admin/users/:id/status', verifyToken, requireRole(['admin']), updateUserStatus as any);
apiRouter.get('/admin/stats', verifyToken, requireRole(['admin']), getStats as any);

// ─── Classes ──────────────────────────────────────────
apiRouter.post('/classes', verifyToken, requireRole(['teacher']), createClass as any);
apiRouter.get('/classes', verifyToken, listClasses as any);
apiRouter.post('/classes/join', verifyToken, requireRole(['student']), joinClass as any);
apiRouter.get('/classes/:id', verifyToken, getClass as any);
apiRouter.get('/classes/:id/students', verifyToken, getClassStudents as any);
apiRouter.delete('/classes/:id', verifyToken, requireRole(['teacher']), deleteClass as any);
apiRouter.patch('/classes/:id/regenerate-code', verifyToken, requireRole(['teacher']), regenerateCode as any);

// ─── Labs ─────────────────────────────────────────────
apiRouter.post('/labs', verifyToken, requireRole(['teacher']), createLab as any);
apiRouter.get('/labs', verifyToken, listLabs as any);
apiRouter.get('/labs/:id', verifyToken, getLab as any);
apiRouter.put('/labs/:id', verifyToken, requireRole(['teacher']), updateLab as any);
apiRouter.delete('/labs/:id', verifyToken, requireRole(['teacher']), deleteLab as any);

// ─── Assignments ──────────────────────────────────────
apiRouter.post('/assignments', verifyToken, requireRole(['teacher']), createAssignment as any);
apiRouter.get('/assignments', verifyToken, listAssignments as any);
apiRouter.post('/assignments/:id/submit', verifyToken, requireRole(['student']), submitAssignment as any);
apiRouter.get('/assignments/:id/submissions', verifyToken, requireRole(['teacher', 'admin']), getSubmissions as any);
apiRouter.put('/assignments/:id/submissions/:sid/grade', verifyToken, requireRole(['teacher']), gradeSubmission as any);

// ─── Collab ───────────────────────────────────────────
apiRouter.post('/collab/sessions', verifyToken, createSession as any);
apiRouter.get('/collab/sessions', verifyToken, listSessions as any);
apiRouter.get('/collab/sessions/:id', verifyToken, getSession as any);
apiRouter.delete('/collab/sessions/:id', verifyToken, endSession as any);

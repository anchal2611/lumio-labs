import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';
import { RoleShell } from '../components/layout/RoleShell';

// Public Pages
import { LandingPage } from '../pages/public/LandingPage';
import { LoginPage } from '../pages/public/LoginPage';
import { RegisterPage } from '../pages/public/RegisterPage';
import { ForgotPasswordPage } from '../pages/public/ForgotPasswordPage';
import { InstituteRegisterPage } from '../pages/public/InstituteRegisterPage';

// Student Pages
import { StudentDashboard } from '../pages/student/StudentDashboard';
import { StudentLabsExplore } from '../pages/student/StudentLabsExplore';
import { StudentLabDetail } from '../pages/student/StudentLabDetail';
import { StudentExperiments } from '../pages/student/StudentExperiments';
import { StudentAssignments } from '../pages/student/StudentAssignments';
import { StudentCollaboration } from '../pages/student/StudentCollaboration';
import { StudentProjects } from '../pages/student/StudentProjects';
import { StudentMessages } from '../pages/student/StudentMessages';
import { StudentResources } from '../pages/student/StudentResources';
import { StudentNotifications } from '../pages/student/StudentNotifications';
import { StudentProfile } from '../pages/student/StudentProfile';
import { StudentSettings } from '../pages/student/StudentSettings';
import { StudentClasses } from '../pages/student/StudentClasses';
import { StudentClassDetail } from '../pages/student/StudentClassDetail';

// Teacher Pages
import { TeacherDashboard } from '../pages/teacher/TeacherDashboard';
import { TeacherLabs } from '../pages/teacher/TeacherLabs';
import { TeacherPracticals } from '../pages/teacher/TeacherPracticals';
import { TeacherAssignments } from '../pages/teacher/TeacherAssignments';
import { TeacherStudents } from '../pages/teacher/TeacherStudents';
import { TeacherCollaboration } from '../pages/teacher/TeacherCollaboration';
import { TeacherResources } from '../pages/teacher/TeacherResources';
import { TeacherMessages } from '../pages/teacher/TeacherMessages';
import { TeacherAnalytics } from '../pages/teacher/TeacherAnalytics';
import { TeacherProfile } from '../pages/teacher/TeacherProfile';
import { TeacherSettings } from '../pages/teacher/TeacherSettings';
import { TeacherClasses } from '../pages/teacher/TeacherClasses';
import { TeacherClassDetail } from '../pages/teacher/TeacherClassDetail';
import { TeacherLabBuilder } from '../pages/teacher/TeacherLabBuilder';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { AdminUsers } from '../pages/admin/AdminUsers';
import { AdminStudents } from '../pages/admin/AdminStudents';
import { AdminTeachers } from '../pages/admin/AdminTeachers';
import { AdminLabs } from '../pages/admin/AdminLabs';
import { AdminAssignments } from '../pages/admin/AdminAssignments';
import { AdminResources } from '../pages/admin/AdminResources';
import { AdminSessions } from '../pages/admin/AdminSessions';
import { AdminReports } from '../pages/admin/AdminReports';
import { AdminSettings } from '../pages/admin/AdminSettings';

// Collab Hub (shared)
import { CollabHub } from '../pages/collaboration/CollabHub';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/institute/register" element={<InstituteRegisterPage />} />

      {/* Student Routes */}
      <Route
        path="/student/*"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <RoleShell>
              <Routes>
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="classes" element={<StudentClasses />} />
                <Route path="classes/:id" element={<StudentClassDetail />} />
                <Route path="labs" element={<StudentLabsExplore />} />
                <Route path="labs/:labId" element={<StudentLabDetail />} />
                <Route path="experiments" element={<StudentExperiments />} />
                <Route path="assignments" element={<StudentAssignments />} />
                <Route path="collaboration" element={<CollabHub />} />
                <Route path="projects" element={<StudentProjects />} />
                <Route path="messages" element={<StudentMessages />} />
                <Route path="resources" element={<StudentResources />} />
                <Route path="notifications" element={<StudentNotifications />} />
                <Route path="profile" element={<StudentProfile />} />
                <Route path="settings" element={<StudentSettings />} />
                <Route path="*" element={<Navigate to="/student/dashboard" replace />} />
              </Routes>
            </RoleShell>
          </ProtectedRoute>
        }
      />

      {/* Teacher Routes */}
      <Route
        path="/teacher/*"
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <RoleShell>
              <Routes>
                <Route path="dashboard" element={<TeacherDashboard />} />
                <Route path="classes" element={<TeacherClasses />} />
                <Route path="classes/:id" element={<TeacherClassDetail />} />
                <Route path="labs" element={<TeacherLabs />} />
                <Route path="labs/new" element={<TeacherLabBuilder />} />
                <Route path="practicals" element={<TeacherPracticals />} />
                <Route path="assignments" element={<TeacherAssignments />} />
                <Route path="students" element={<TeacherStudents />} />
                <Route path="collaboration" element={<CollabHub />} />
                <Route path="resources" element={<TeacherResources />} />
                <Route path="messages" element={<TeacherMessages />} />
                <Route path="analytics" element={<TeacherAnalytics />} />
                <Route path="profile" element={<TeacherProfile />} />
                <Route path="settings" element={<TeacherSettings />} />
                <Route path="*" element={<Navigate to="/teacher/dashboard" replace />} />
              </Routes>
            </RoleShell>
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <RoleShell>
              <Routes>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="students" element={<AdminStudents />} />
                <Route path="teachers" element={<AdminTeachers />} />
                <Route path="labs" element={<AdminLabs />} />
                <Route path="assignments" element={<AdminAssignments />} />
                <Route path="resources" element={<AdminResources />} />
                <Route path="sessions" element={<AdminSessions />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
              </Routes>
            </RoleShell>
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

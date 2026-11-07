import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';
import { RoleShell } from '../components/layout/RoleShell';

const lazyPage = (load: () => Promise<any>, exportName: string) =>
  React.lazy(async () => ({ default: (await load())[exportName] }));

const LandingPage = lazyPage(() => import('../pages/public/LandingPage'), 'LandingPage');
const LoginPage = lazyPage(() => import('../pages/public/LoginPage'), 'LoginPage');
const RegisterPage = lazyPage(() => import('../pages/public/RegisterPage'), 'RegisterPage');
const ForgotPasswordPage = lazyPage(() => import('../pages/public/ForgotPasswordPage'), 'ForgotPasswordPage');
const InstituteRegisterPage = lazyPage(() => import('../pages/public/InstituteRegisterPage'), 'InstituteRegisterPage');
const StudentDashboard = lazyPage(() => import('../pages/student/StudentDashboard'), 'StudentDashboard');
const StudentLabsExplore = lazyPage(() => import('../pages/student/StudentLabsExplore'), 'StudentLabsExplore');
const StudentLabDetail = lazyPage(() => import('../pages/student/StudentLabDetail'), 'StudentLabDetail');
const StudentExperiments = lazyPage(() => import('../pages/student/StudentExperiments'), 'StudentExperiments');
const StudentAssignments = lazyPage(() => import('../pages/student/StudentAssignments'), 'StudentAssignments');
const StudentProjects = lazyPage(() => import('../pages/student/StudentProjects'), 'StudentProjects');
const StudentMessages = lazyPage(() => import('../pages/student/StudentMessages'), 'StudentMessages');
const StudentResources = lazyPage(() => import('../pages/student/StudentResources'), 'StudentResources');
const StudentNotifications = lazyPage(() => import('../pages/student/StudentNotifications'), 'StudentNotifications');
const StudentProfile = lazyPage(() => import('../pages/student/StudentProfile'), 'StudentProfile');
const StudentSettings = lazyPage(() => import('../pages/student/StudentSettings'), 'StudentSettings');
const StudentClasses = lazyPage(() => import('../pages/student/StudentClasses'), 'StudentClasses');
const StudentClassDetail = lazyPage(() => import('../pages/student/StudentClassDetail'), 'StudentClassDetail');
const TeacherDashboard = lazyPage(() => import('../pages/teacher/TeacherDashboard'), 'TeacherDashboard');
const TeacherLabs = lazyPage(() => import('../pages/teacher/TeacherLabs'), 'TeacherLabs');
const TeacherPracticals = lazyPage(() => import('../pages/teacher/TeacherPracticals'), 'TeacherPracticals');
const TeacherAssignments = lazyPage(() => import('../pages/teacher/TeacherAssignments'), 'TeacherAssignments');
const TeacherStudents = lazyPage(() => import('../pages/teacher/TeacherStudents'), 'TeacherStudents');
const TeacherResources = lazyPage(() => import('../pages/teacher/TeacherResources'), 'TeacherResources');
const TeacherMessages = lazyPage(() => import('../pages/teacher/TeacherMessages'), 'TeacherMessages');
const TeacherAnalytics = lazyPage(() => import('../pages/teacher/TeacherAnalytics'), 'TeacherAnalytics');
const TeacherProfile = lazyPage(() => import('../pages/teacher/TeacherProfile'), 'TeacherProfile');
const TeacherSettings = lazyPage(() => import('../pages/teacher/TeacherSettings'), 'TeacherSettings');
const TeacherClasses = lazyPage(() => import('../pages/teacher/TeacherClasses'), 'TeacherClasses');
const TeacherClassDetail = lazyPage(() => import('../pages/teacher/TeacherClassDetail'), 'TeacherClassDetail');
const TeacherLabBuilder = lazyPage(() => import('../pages/teacher/TeacherLabBuilder'), 'TeacherLabBuilder');
const AdminDashboard = lazyPage(() => import('../pages/admin/AdminDashboard'), 'AdminDashboard');
const AdminUsers = lazyPage(() => import('../pages/admin/AdminUsers'), 'AdminUsers');
const AdminStudents = lazyPage(() => import('../pages/admin/AdminStudents'), 'AdminStudents');
const AdminClasses = lazyPage(() => import('../pages/admin/AdminClasses'), 'AdminClasses');
const AdminTeachers = lazyPage(() => import('../pages/admin/AdminTeachers'), 'AdminTeachers');
const AdminLabs = lazyPage(() => import('../pages/admin/AdminLabs'), 'AdminLabs');
const AdminAssignments = lazyPage(() => import('../pages/admin/AdminAssignments'), 'AdminAssignments');
const AdminResources = lazyPage(() => import('../pages/admin/AdminResources'), 'AdminResources');
const AdminSessions = lazyPage(() => import('../pages/admin/AdminSessions'), 'AdminSessions');
const AdminReports = lazyPage(() => import('../pages/admin/AdminReports'), 'AdminReports');
const AdminSettings = lazyPage(() => import('../pages/admin/AdminSettings'), 'AdminSettings');
const CollabHub = lazyPage(() => import('../pages/collaboration/CollabHub'), 'CollabHub');
const MessagesPage = lazyPage(() => import('../pages/shared/MessagesPage'), 'MessagesPage');
const NotificationsPage = lazyPage(() => import('../pages/shared/NotificationsPage'), 'NotificationsPage');

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<div className="flex min-h-[50vh] items-center justify-center text-sm text-slate-500">Loading page…</div>}>
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
                <Route path="notifications" element={<NotificationsPage />} />
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
                <Route path="classes" element={<AdminClasses />} />
                <Route path="messages" element={<MessagesPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
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
    </Suspense>
  );
};

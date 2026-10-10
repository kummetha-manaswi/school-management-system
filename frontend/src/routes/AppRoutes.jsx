import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import DashboardShell from '../pages/DashboardShell';
import StudentListPage from '../pages/students/StudentListPage';
import StudentFormPage from '../pages/students/StudentFormPage';
import TeacherListPage from '../pages/teachers/TeacherListPage';
import TeacherFormPage from '../pages/teachers/TeacherFormPage';
import AttendancePage from '../pages/attendance/AttendancePage';
import AssignmentListPage from '../pages/assignments/AssignmentListPage';
import AssignmentFormPage from '../pages/assignments/AssignmentFormPage';
import ExamListPage from '../pages/exams/ExamListPage';
import ExamFormPage from '../pages/exams/ExamFormPage';
import ExamResultsPage from '../pages/exams/ExamResultsPage';
import NoteListPage from '../pages/notes/NoteListPage';
import ParentListPage from '../pages/parents/ParentListPage';
import ParentDetailsPage from '../pages/parents/ParentDetailsPage';
import NotFound from '../pages/NotFound';
import LoginPage from '../pages/auth/LoginPage';
import ProtectedRoute from '../components/auth/ProtectedRoute';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Authentication Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Admin & Academic Management Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        {/* Foundation Dashboard */}
        <Route index element={<DashboardShell />} />

        {/* Academic & Parent Domain: Student Management */}
        <Route path="academic/students" element={<StudentListPage />} />
        <Route path="academic/students/new" element={<StudentFormPage />} />
        <Route path="academic/students/:id/edit" element={<StudentFormPage />} />

        {/* Academic & Parent Domain: Teacher Management */}
        <Route path="academic/teachers" element={<TeacherListPage />} />
        <Route path="academic/teachers/new" element={<TeacherFormPage />} />
        <Route path="academic/teachers/:id/edit" element={<TeacherFormPage />} />

        {/* Academic & Parent Domain: Attendance Management */}
        <Route path="academic/attendance" element={<AttendancePage />} />

        {/* Academic & Parent Domain: Assignments Management */}
        <Route path="academic/assignments" element={<AssignmentListPage />} />
        <Route path="academic/assignments/new" element={<AssignmentFormPage />} />
        <Route path="academic/assignments/:id/edit" element={<AssignmentFormPage />} />

        {/* Academic & Parent Domain: Exams & Results Management */}
        <Route path="academic/exams" element={<ExamListPage />} />
        <Route path="academic/exams/new" element={<ExamFormPage />} />
        <Route path="academic/exams/:id/edit" element={<ExamFormPage />} />
        <Route path="academic/exams/:id/results" element={<ExamResultsPage />} />

        {/* Academic & Parent Domain: Teacher Notes */}
        <Route path="academic/notes" element={<NoteListPage />} />

        {/* Academic & Parent Domain: Parent Management */}
        <Route path="academic/parents" element={<ParentListPage />} />
        <Route path="academic/parents/:id" element={<ParentDetailsPage />} />

        {/* Catch-all 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;

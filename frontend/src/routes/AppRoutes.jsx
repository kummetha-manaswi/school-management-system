import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import DashboardShell from '../pages/DashboardShell';
import StudentListPage from '../pages/students/StudentListPage';
import StudentFormPage from '../pages/students/StudentFormPage';
import TeacherListPage from '../pages/teachers/TeacherListPage';
import TeacherFormPage from '../pages/teachers/TeacherFormPage';
import NotFound from '../pages/NotFound';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
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

        {/* Catch-all 404 Route */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;

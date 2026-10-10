const express = require('express');
const { authenticate } = require('../middleware/auth');
const studentRoutes = require('./student.routes');
const teacherRoutes = require('./teacher.routes');
const attendanceRoutes = require('./attendance.routes');
const assignmentRoutes = require('./assignment.routes');
const examRoutes = require('./exam.routes');
const noteRoutes = require('./note.routes');
const parentRoutes = require('./parent.routes');
const parentStudentRoutes = require('./parentStudent.routes');
const parentAcademicRoutes = require('./parentAcademic.routes');

const router = express.Router();

/**
 * Academic Domain Status Endpoint (Intentionally public health check)
 */
router.get('/status', (req, res) => {
  res.status(200).json({
    module: 'academic',
    status: 'active',
    submodules: ['students', 'teachers', 'attendance', 'assignments', 'exams', 'notes', 'parents', 'parent-students', 'parent'],
    message: 'Academic & Parent module online',
  });
});

/**
 * PARENT ACADEMIC PORTAL:
 * Mounted before staff `authenticate` middleware. Uses its own `authenticateParent`
 * guard to strictly require Parent tokens and reject staff tokens.
 */
router.use('/parent', parentAcademicRoutes);

/**
 * SECURITY GUARD:
 * All subsequent academic APIs deal with sensitive institutional, student,
 * staff, and evaluation records. Require valid staff JWT authentication.
 */
router.use(authenticate);

// Student Management routes: /api/academic/students
router.use('/students', studentRoutes);

// Teacher Management routes: /api/academic/teachers
router.use('/teachers', teacherRoutes);

// Attendance Management routes: /api/academic/attendance
router.use('/attendance', attendanceRoutes);

// Assignment Management routes: /api/academic/assignments
router.use('/assignments', assignmentRoutes);

// Exam & Results Management routes: /api/academic/exams
router.use('/exams', examRoutes);

// Teacher Notes Management routes: /api/academic/notes
router.use('/notes', noteRoutes);

// Parent Account Management routes: /api/academic/parents
router.use('/parents', parentRoutes);

// Parent-Student Relationship Management routes: /api/academic/parent-students
router.use('/parent-students', parentStudentRoutes);

module.exports = router;

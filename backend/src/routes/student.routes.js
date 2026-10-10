const express = require('express');
const studentController = require('../controllers/student.controller');
const parentController = require('../controllers/parent.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

/**
 * Student Management Routes
 * Base route: /api/academic/students
 * 
 * SECURITY POLICY:
 * - All endpoints require valid JWT authentication.
 * - Until teacher assignment and class/section scoping are implemented,
 *   student record management is restricted to administrators (admin).
 */
router.use(authenticate);
router.use(authorizeRoles('admin'));

// GET /api/academic/students - List students with search and filters
router.get('/', (req, res, next) => studentController.getStudents(req, res, next));

// POST /api/academic/students - Create a new student
router.post('/', (req, res, next) => studentController.createStudent(req, res, next));

// GET /api/academic/students/:id - Get student by ID
router.get('/:id', (req, res, next) => studentController.getStudentById(req, res, next));

// PUT /api/academic/students/:id - Update student by ID
router.put('/:id', (req, res, next) => studentController.updateStudent(req, res, next));

// DELETE /api/academic/students/:id - Delete student by ID
router.delete('/:id', (req, res, next) => studentController.deleteStudent(req, res, next));

// GET /api/academic/students/:id/parents - List verified/linked parents for a student
router.get('/:id/parents', (req, res, next) => parentController.getLinkedParentsForStudent(req, res, next));

module.exports = router;

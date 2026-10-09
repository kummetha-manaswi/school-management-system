const express = require('express');
const studentController = require('../controllers/student.controller');

const router = express.Router();

/**
 * Student Management Routes
 * Base route: /api/academic/students
 */

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

module.exports = router;

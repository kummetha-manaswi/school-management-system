const express = require('express');
const teacherController = require('../controllers/teacher.controller');

const router = express.Router();

/**
 * Teacher Management Routes
 * Base route: /api/academic/teachers
 */

// GET /api/academic/teachers - List teachers with search and filters
router.get('/', (req, res, next) => teacherController.getTeachers(req, res, next));

// POST /api/academic/teachers - Create a new teacher
router.post('/', (req, res, next) => teacherController.createTeacher(req, res, next));

// GET /api/academic/teachers/:id - Get teacher by ID
router.get('/:id', (req, res, next) => teacherController.getTeacherById(req, res, next));

// PUT /api/academic/teachers/:id - Update teacher by ID
router.put('/:id', (req, res, next) => teacherController.updateTeacher(req, res, next));

// DELETE /api/academic/teachers/:id - Delete teacher by ID
router.delete('/:id', (req, res, next) => teacherController.deleteTeacher(req, res, next));

module.exports = router;

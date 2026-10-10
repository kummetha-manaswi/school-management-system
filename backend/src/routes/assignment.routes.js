const express = require('express');
const assignmentController = require('../controllers/assignment.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

/**
 * Assignment Management Routes
 * Base route: /api/academic/assignments
 *
 * SECURITY POLICY:
 * - All endpoints require valid JWT authentication.
 * - Until teacher-specific class, section, and subject scoping is implemented,
 *   assignment creation, modification, deletion, and full list retrieval
 *   are restricted to administrators (admin).
 */
router.use(authenticate);
router.use(authorizeRoles('admin'));

// GET /api/academic/assignments/summary - Overview counts
router.get('/summary', (req, res, next) => assignmentController.getSummary(req, res, next));

// GET /api/academic/assignments - List assignments with search and filters
router.get('/', (req, res, next) => assignmentController.getAllAssignments(req, res, next));

// POST /api/academic/assignments - Create a new assignment
router.post('/', (req, res, next) => assignmentController.createAssignment(req, res, next));

// GET /api/academic/assignments/:id - Retrieve assignment by ID
router.get('/:id', (req, res, next) => assignmentController.getAssignmentById(req, res, next));

// PUT /api/academic/assignments/:id - Update assignment by ID
router.put('/:id', (req, res, next) => assignmentController.updateAssignment(req, res, next));

// DELETE /api/academic/assignments/:id - Delete assignment by ID
router.delete('/:id', (req, res, next) => assignmentController.deleteAssignment(req, res, next));

module.exports = router;

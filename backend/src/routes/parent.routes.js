const express = require('express');
const parentController = require('../controllers/parent.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

/**
 * Parent Management Routes
 * Base route: /api/academic/parents
 * 
 * SECURITY POLICY:
 * - All endpoints require valid JWT authentication.
 * - All parent management and relationship linking operations are strictly
 *   restricted to administrators (admin).
 */
router.use(authenticate);
router.use(authorizeRoles('admin'));

// GET /api/academic/parents - List and search parent accounts
router.get('/', (req, res, next) => parentController.getAllParents(req, res, next));

// POST /api/academic/parents - Create a new parent account
router.post('/', (req, res, next) => parentController.createParent(req, res, next));

// GET /api/academic/parents/:id - Get parent details along with linked students
router.get('/:id', (req, res, next) => parentController.getParentById(req, res, next));

// PUT /api/academic/parents/:id - Update parent account
router.put('/:id', (req, res, next) => parentController.updateParent(req, res, next));

// PATCH /api/academic/parents/:id/status - Update account status (active, inactive, suspended)
router.patch('/:id/status', (req, res, next) => parentController.updateParentStatus(req, res, next));

// GET /api/academic/parents/:id/students - List a parent's linked students
router.get('/:id/students', (req, res, next) => parentController.getLinkedStudents(req, res, next));

// POST /api/academic/parents/:id/students - Link a student to this parent
router.post('/:id/students', (req, res, next) => parentController.linkStudentToParent(req, res, next));

module.exports = router;

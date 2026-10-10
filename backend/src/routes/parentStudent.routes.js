const express = require('express');
const parentController = require('../controllers/parent.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

/**
 * Parent-Student Relationship Management Routes
 * Base route: /api/academic/parent-students
 * 
 * SECURITY POLICY:
 * - All endpoints require valid JWT authentication.
 * - Verifying and revoking relationships are strictly restricted to administrators (admin).
 */
router.use(authenticate);
router.use(authorizeRoles('admin'));

// PATCH /api/academic/parent-students/:id/verify - Verify relationship link
router.patch('/:id/verify', (req, res, next) => parentController.verifyRelationship(req, res, next));

// PATCH /api/academic/parent-students/:id/revoke - Revoke relationship link
router.patch('/:id/revoke', (req, res, next) => parentController.revokeRelationship(req, res, next));

module.exports = router;

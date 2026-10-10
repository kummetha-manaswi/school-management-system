const express = require('express');
const authController = require('../controllers/auth.controller');
const {
  authenticate,
  authorizeRoles,
  authenticateParent,
} = require('../middleware/auth');

const router = express.Router();

/**
 * Staff Authentication Routes
 * Base route: /api/auth
 */

// POST /api/auth/staff/login - Public staff sign-in endpoint
router.post('/staff/login', (req, res, next) =>
  authController.loginStaff(req, res, next)
);

// GET /api/auth/staff/me - Authenticated staff session verification (strictly staff-only)
router.get(
  '/staff/me',
  authenticate,
  authorizeRoles('admin', 'teacher'),
  (req, res, next) => authController.getStaffProfile(req, res, next)
);

/**
 * Parent Authentication Routes
 * Base route: /api/auth
 */

// POST /api/auth/parent/login - Dedicated parent sign-in endpoint
router.post('/parent/login', (req, res, next) =>
  authController.loginParent(req, res, next)
);

// GET /api/auth/parent/me - Dedicated parent session verification
router.get('/parent/me', authenticateParent, (req, res, next) =>
  authController.getParentProfile(req, res, next)
);

module.exports = router;

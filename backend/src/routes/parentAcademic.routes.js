const express = require('express');
const { authenticateParent, authorizeParentChild } = require('../middleware/parentAuth');
const parentAcademicController = require('../controllers/parentAcademic.controller');

const router = express.Router();

/**
 * SECURITY GUARD:
 * All routes under /api/academic/parent require valid Parent JWT authentication.
 * Staff tokens are strictly forbidden.
 */
router.use(authenticateParent);

// Parent overview dashboard
router.get('/summary', parentAcademicController.getDashboardSummary);

// Parent verified children list
router.get('/children', parentAcademicController.getVerifiedChildren);

// Parent profile & session details
router.get('/profile', parentAcademicController.getParentProfile);

// Child profile (requires verified relationship)
router.get(
  '/children/:studentId',
  authorizeParentChild,
  parentAcademicController.getChildProfile
);

// Child attendance history & metrics (requires verified relationship)
router.get(
  '/children/:studentId/attendance',
  authorizeParentChild,
  parentAcademicController.getChildAttendance
);

// Child assignments (requires verified relationship)
router.get(
  '/children/:studentId/assignments',
  authorizeParentChild,
  parentAcademicController.getChildAssignments
);

// Child exams and published results (requires verified relationship)
router.get(
  '/children/:studentId/exams',
  authorizeParentChild,
  parentAcademicController.getChildExamsAndResults
);

module.exports = router;

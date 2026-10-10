const express = require('express');
const attendanceController = require('../controllers/attendance.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

/**
 * Attendance Management Routes
 * Base route: /api/academic/attendance
 *
 * SECURITY POLICY:
 * - All endpoints require valid JWT authentication.
 * - Until teacher-specific class and section scoping is implemented,
 *   attendance records and bulk marking are restricted to administrators (admin).
 */
router.use(authenticate);
router.use(authorizeRoles('admin'));

// GET /api/academic/attendance/summary - Return attendance counts for date, class, and section
router.get('/summary', (req, res, next) => attendanceController.getSummary(req, res, next));

// POST /api/academic/attendance/bulk - Bulk mark/save attendance for a class roster
router.post('/bulk', (req, res, next) => attendanceController.bulkMarkAttendance(req, res, next));

// GET /api/academic/attendance - List attendance records with date, class, section, status filters
router.get('/', (req, res, next) => attendanceController.getAttendance(req, res, next));

// POST /api/academic/attendance - Mark attendance for a student
router.post('/', (req, res, next) => attendanceController.markAttendance(req, res, next));

// GET /api/academic/attendance/:id - Retrieve single attendance record
router.get('/:id', (req, res, next) => attendanceController.getAttendanceById(req, res, next));

// PUT /api/academic/attendance/:id - Update attendance record
router.put('/:id', (req, res, next) => attendanceController.updateAttendance(req, res, next));

module.exports = router;

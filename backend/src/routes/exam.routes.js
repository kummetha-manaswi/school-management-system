const express = require('express');
const examController = require('../controllers/exam.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

/**
 * Exam and Result Management Routes
 * Base route: /api/academic/exams
 *
 * SECURITY POLICY:
 * - All endpoints require valid JWT authentication.
 * - Until teacher-specific class, section, and subject scoping is implemented,
 *   exam scheduling, maximum/passing mark edits, and result entry
 *   are restricted to administrators (admin).
 */
router.use(authenticate);
router.use(authorizeRoles('admin'));

// GET /api/academic/exams/summary - Overall KPIs and summary counts
router.get('/summary', (req, res, next) => examController.getSummary(req, res, next));

// GET /api/academic/exams - List exams with filtering, pagination, and sorting
router.get('/', (req, res, next) => examController.getAllExams(req, res, next));

// POST /api/academic/exams - Create a new exam
router.post('/', (req, res, next) => examController.createExam(req, res, next));

// GET /api/academic/exams/:id - Retrieve exam details
router.get('/:id', (req, res, next) => examController.getExamById(req, res, next));

// PUT /api/academic/exams/:id - Update an exam
router.put('/:id', (req, res, next) => examController.updateExam(req, res, next));

// DELETE /api/academic/exams/:id - Delete an exam and all associated results
router.delete('/:id', (req, res, next) => examController.deleteExam(req, res, next));

// --- Result Routes for an Exam ---

// GET /api/academic/exams/:id/results - List results for this exam
router.get('/:id/results', (req, res, next) => examController.getExamResults(req, res, next));

// POST /api/academic/exams/:id/results - Record a single student result
router.post('/:id/results', (req, res, next) => examController.recordStudentResult(req, res, next));

// POST /api/academic/exams/:id/results/bulk - Bulk record/correct results for a class roster
router.post('/:id/results/bulk', (req, res, next) => examController.bulkRecordResults(req, res, next));

// GET /api/academic/exams/:id/statistics - Class-level performance analytics for this exam
router.get('/:id/statistics', (req, res, next) => examController.getExamStatistics(req, res, next));

// PUT /api/academic/exams/:id/results/:resultId - Update a student's result
router.put('/:id/results/:resultId', (req, res, next) => examController.updateResult(req, res, next));

// DELETE /api/academic/exams/:id/results/:resultId - Remove a single student's result
router.delete('/:id/results/:resultId', (req, res, next) => examController.deleteResult(req, res, next));

// --- Exam Results Publication Controls (Admin only) ---

// PATCH /api/academic/exams/:id/publish - Publish exam results
router.patch('/:id/publish', (req, res, next) => examController.publishExamResults(req, res, next));

// PATCH /api/academic/exams/:id/unpublish - Unpublish exam results
router.patch('/:id/unpublish', (req, res, next) => examController.unpublishExamResults(req, res, next));

module.exports = router;

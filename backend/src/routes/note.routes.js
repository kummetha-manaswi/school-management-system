const express = require('express');
const noteController = require('../controllers/note.controller');
const { authenticate, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

/**
 * Teacher Notes Management Routes
 * Base route: /api/academic/notes
 * 
 * SENSITIVITY & SECURITY NOTICE:
 * Student notes are classified as sensitive educational records.
 * The `authenticate` and `authorizeRoles` middlewares attached below currently act
 * as developmental pass-through stubs. This module is NOT secured for production use
 * until authentic token verification and RBAC are enabled.
 * 
 * Student-specific endpoints (such as /student/:studentId) are deliberately NOT exposed
 * in this phase to prevent unauthenticated data leakage.
 */

// Apply auth middleware placeholders
router.use(authenticate);
router.use(authorizeRoles('admin', 'teacher'));

// GET /api/academic/notes/summary - Category breakdown metrics
// CRITICAL: Registered BEFORE /:id to prevent route clash
router.get('/summary', (req, res, next) => noteController.getSummary(req, res, next));

// GET /api/academic/notes - List notes with search, category, student, teacher, date filters, and pagination
router.get('/', (req, res, next) => noteController.getAllNotes(req, res, next));

// POST /api/academic/notes - Create a new note
router.post('/', (req, res, next) => noteController.createNote(req, res, next));

// GET /api/academic/notes/:id - Retrieve single note details
router.get('/:id', (req, res, next) => noteController.getNoteById(req, res, next));

// PUT /api/academic/notes/:id - Update note by ID
router.put('/:id', (req, res, next) => noteController.updateNote(req, res, next));

// DELETE /api/academic/notes/:id - Delete note by ID
router.delete('/:id', (req, res, next) => noteController.deleteNote(req, res, next));

module.exports = router;

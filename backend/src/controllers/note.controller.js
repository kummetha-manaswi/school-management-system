const noteService = require('../services/note.service');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

/**
 * Controller handling Teacher Notes HTTP endpoints
 *
 * SENSITIVITY & CONFIDENTIALITY POLICY:
 * - Student notes represent confidential educational and behavioral observations.
 * - Administrators have full supervisory access across all notes.
 * - Teachers are strictly restricted to authoring, reading, editing, and deleting
 *   only their own notes. Author identity is bound to verified JWT claims
 *   (req.user.teacherId) and never trusted from client payloads.
 */
class NoteController {
  async createNote(req, res, next) {
    try {
      const data = { ...req.body };

      if (req.user.role === 'teacher') {
        if (!req.user.teacherId) {
          throw new ApiError(403, 'Access denied: A linked teacher profile is required to author notes.');
        }
        // Force author to be the authenticated teacher
        data.teacher = req.user.teacherId;
      }

      const note = await noteService.createNote(data);
      res.status(201).json(new ApiResponse(201, note, 'Teacher note created successfully'));
    } catch (error) {
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((e) => e.message);
        return next(new ApiError(400, `Validation Error: ${messages.join(', ')}`, messages));
      }
      next(error);
    }
  }

  async getAllNotes(req, res, next) {
    try {
      const query = { ...req.query };

      // Scoping: teachers can only retrieve their own notes
      if (req.user.role === 'teacher') {
        if (!req.user.teacherId) {
          return res.status(200).json(
            new ApiResponse(200, { notes: [], total: 0, page: 1, totalPages: 0 }, 'Teacher notes fetched successfully')
          );
        }
        query.teacher = req.user.teacherId;
      }

      const result = await noteService.getAllNotes(query);
      res.status(200).json(new ApiResponse(200, result, 'Teacher notes fetched successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getSummary(req, res, next) {
    try {
      const query = { ...req.query };

      // Scoping: teachers can only retrieve metrics for their own notes
      if (req.user.role === 'teacher') {
        if (!req.user.teacherId) {
          return res.status(200).json(
            new ApiResponse(200, {
              total: 0,
              academic_progress: 0,
              classroom_participation: 0,
              behavior: 0,
              general_observation: 0,
            }, 'Notes summary fetched successfully')
          );
        }
        query.teacher = req.user.teacherId;
      }

      const summary = await noteService.getNoteSummary(query);
      res.status(200).json(new ApiResponse(200, summary, 'Notes summary fetched successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getNoteById(req, res, next) {
    try {
      const note = await noteService.getNoteById(req.params.id);

      // Confidentiality check: teachers can only view their own notes
      if (req.user.role === 'teacher') {
        const authorId = note.teacher?._id?.toString() || note.teacher?.toString();
        if (!req.user.teacherId || authorId !== req.user.teacherId.toString()) {
          throw new ApiError(403, 'Access denied: You can only view notes authored by yourself.');
        }
      }

      res.status(200).json(new ApiResponse(200, note, 'Teacher note details fetched successfully'));
    } catch (error) {
      next(error);
    }
  }

  async updateNote(req, res, next) {
    try {
      const existing = await noteService.getNoteById(req.params.id);
      const updateData = { ...req.body };

      // Confidentiality & Authorship check: teachers can only edit their own notes
      if (req.user.role === 'teacher') {
        const authorId = existing.teacher?._id?.toString() || existing.teacher?.toString();
        if (!req.user.teacherId || authorId !== req.user.teacherId.toString()) {
          throw new ApiError(403, 'Access denied: You can only edit notes authored by yourself.');
        }
        delete updateData.teacher; // Disallow reassignment of author
      }

      const note = await noteService.updateNote(req.params.id, updateData);
      res.status(200).json(new ApiResponse(200, note, 'Teacher note updated successfully'));
    } catch (error) {
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((e) => e.message);
        return next(new ApiError(400, `Validation Error: ${messages.join(', ')}`, messages));
      }
      next(error);
    }
  }

  async deleteNote(req, res, next) {
    try {
      const existing = await noteService.getNoteById(req.params.id);

      // Confidentiality & Authorship check: teachers can only delete their own notes
      if (req.user.role === 'teacher') {
        const authorId = existing.teacher?._id?.toString() || existing.teacher?.toString();
        if (!req.user.teacherId || authorId !== req.user.teacherId.toString()) {
          throw new ApiError(403, 'Access denied: You can only delete notes authored by yourself.');
        }
      }

      const note = await noteService.deleteNote(req.params.id);
      res.status(200).json(new ApiResponse(200, note, 'Teacher note removed successfully'));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NoteController();

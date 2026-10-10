const parentService = require('../services/parent.service');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

/**
 * Controller handling Parent Account and Parent-Student Relationship HTTP endpoints
 * All operations are restricted to verified administrators.
 */
class ParentController {
  async createParent(req, res, next) {
    try {
      const parent = await parentService.createParent(req.body);
      res.status(201).json(new ApiResponse(201, parent, 'Parent account created successfully'));
    } catch (error) {
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((e) => e.message);
        return next(new ApiError(400, `Validation Error: ${messages.join(', ')}`, messages));
      }
      next(error);
    }
  }

  async getAllParents(req, res, next) {
    try {
      const result = await parentService.getAllParents(req.query);
      res.status(200).json(new ApiResponse(200, result, 'Parent accounts retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getParentById(req, res, next) {
    try {
      const result = await parentService.getParentById(req.params.id);
      res.status(200).json(new ApiResponse(200, result, 'Parent account details retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  async updateParent(req, res, next) {
    try {
      const parent = await parentService.updateParent(req.params.id, req.body);
      res.status(200).json(new ApiResponse(200, parent, 'Parent account updated successfully'));
    } catch (error) {
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((e) => e.message);
        return next(new ApiError(400, `Validation Error: ${messages.join(', ')}`, messages));
      }
      next(error);
    }
  }

  async updateParentStatus(req, res, next) {
    try {
      const { status } = req.body;
      if (!status) {
        return next(new ApiError(400, 'Status is required (active, inactive, suspended)'));
      }
      const parent = await parentService.updateParentStatus(req.params.id, status);
      res.status(200).json(new ApiResponse(200, parent, `Parent account status updated to ${status}`));
    } catch (error) {
      next(error);
    }
  }

  async linkStudentToParent(req, res, next) {
    try {
      const { studentId } = req.body;
      if (!studentId) {
        return next(new ApiError(400, 'Student ID (studentId) is required'));
      }
      const relationship = await parentService.linkStudentToParent(
        req.params.id,
        studentId,
        req.body,
        req.user?.userId
      );
      res.status(201).json(new ApiResponse(201, relationship, 'Parent linked to student successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getLinkedStudents(req, res, next) {
    try {
      const students = await parentService.getLinkedStudents(req.params.id);
      res.status(200).json(new ApiResponse(200, students, 'Linked students retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getLinkedParentsForStudent(req, res, next) {
    try {
      const parents = await parentService.getLinkedParents(req.params.id);
      res.status(200).json(new ApiResponse(200, parents, 'Linked parents retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  async verifyRelationship(req, res, next) {
    try {
      const relationship = await parentService.verifyRelationship(req.params.id, req.user?.userId);
      res.status(200).json(new ApiResponse(200, relationship, 'Parent-student relationship verified successfully'));
    } catch (error) {
      next(error);
    }
  }

  async revokeRelationship(req, res, next) {
    try {
      const { reason = '' } = req.body || {};
      const relationship = await parentService.revokeRelationship(
        req.params.id,
        req.user?.userId,
        reason
      );
      res.status(200).json(new ApiResponse(200, relationship, 'Parent-student relationship revoked successfully'));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ParentController();

const assignmentService = require('../services/assignment.service');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

/**
 * Controller handling Assignment HTTP requests and formatting responses
 */
class AssignmentController {
  async createAssignment(req, res, next) {
    try {
      const assignment = await assignmentService.createAssignment(req.body);
      res.status(201).json(new ApiResponse(201, assignment, 'Assignment created successfully'));
    } catch (error) {
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((e) => e.message);
        return next(new ApiError(400, `Validation Error: ${messages.join(', ')}`, messages));
      }
      next(error);
    }
  }

  async getAllAssignments(req, res, next) {
    try {
      const result = await assignmentService.getAllAssignments(req.query);
      res.status(200).json(new ApiResponse(200, result, 'Assignments fetched successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getSummary(req, res, next) {
    try {
      const summary = await assignmentService.getAssignmentSummary(req.query);
      res.status(200).json(new ApiResponse(200, summary, 'Assignment summary fetched successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getAssignmentById(req, res, next) {
    try {
      const assignment = await assignmentService.getAssignmentById(req.params.id);
      res.status(200).json(new ApiResponse(200, assignment, 'Assignment details fetched successfully'));
    } catch (error) {
      next(error);
    }
  }

  async updateAssignment(req, res, next) {
    try {
      const assignment = await assignmentService.updateAssignment(req.params.id, req.body);
      res.status(200).json(new ApiResponse(200, assignment, 'Assignment updated successfully'));
    } catch (error) {
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((e) => e.message);
        return next(new ApiError(400, `Validation Error: ${messages.join(', ')}`, messages));
      }
      next(error);
    }
  }

  async deleteAssignment(req, res, next) {
    try {
      const assignment = await assignmentService.deleteAssignment(req.params.id);
      res.status(200).json(new ApiResponse(200, assignment, 'Assignment removed successfully'));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AssignmentController();

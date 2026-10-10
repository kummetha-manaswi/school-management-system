const parentAcademicService = require('../services/parentAcademic.service');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Controller handling Parent-facing academic data and profile read endpoints.
 * All actions are strictly read-only and gated by parent authentication & verified relationship.
 */
class ParentAcademicController {
  async getDashboardSummary(req, res, next) {
    try {
      const summary = await parentAcademicService.getParentDashboardSummary(req.parent._id);
      res.status(200).json(new ApiResponse(200, summary, 'Parent dashboard summary retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getVerifiedChildren(req, res, next) {
    try {
      const children = await parentAcademicService.getVerifiedChildren(req.parent._id);
      res.status(200).json(new ApiResponse(200, children, 'Verified linked children retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getChildProfile(req, res, next) {
    try {
      const profile = await parentAcademicService.getChildProfile(req.student, req.relationship);
      res.status(200).json(new ApiResponse(200, profile, 'Child profile retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getChildAttendance(req, res, next) {
    try {
      const attendance = await parentAcademicService.getChildAttendance(req.student, req.query);
      res.status(200).json(new ApiResponse(200, attendance, 'Child attendance retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getChildAssignments(req, res, next) {
    try {
      const assignments = await parentAcademicService.getChildAssignments(req.student, req.query);
      res.status(200).json(new ApiResponse(200, assignments, 'Child assignments retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getChildExamsAndResults(req, res, next) {
    try {
      const exams = await parentAcademicService.getChildExamsAndResults(req.student, req.query);
      res.status(200).json(new ApiResponse(200, exams, 'Child exams and results retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getParentProfile(req, res, next) {
    try {
      const profile = await parentAcademicService.getParentProfile(req.parent._id);
      res.status(200).json(new ApiResponse(200, profile, 'Parent profile retrieved successfully'));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ParentAcademicController();

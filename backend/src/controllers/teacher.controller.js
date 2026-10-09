const teacherService = require('../services/teacher.service');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

/**
 * Controller handling Teacher HTTP requests and formatting responses
 */
class TeacherController {
  async createTeacher(req, res, next) {
    try {
      const teacher = await teacherService.createTeacher(req.body);
      res.status(201).json(new ApiResponse(201, teacher, 'Teacher registered successfully'));
    } catch (error) {
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((e) => e.message);
        return next(new ApiError(400, `Validation Error: ${messages.join(', ')}`, messages));
      }
      if (error.code === 11000) {
        return next(new ApiError(409, 'Employee ID already exists in the system'));
      }
      next(error);
    }
  }

  async getTeachers(req, res, next) {
    try {
      const result = await teacherService.getAllTeachers(req.query);
      res.status(200).json(new ApiResponse(200, result, 'Teachers fetched successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getTeacherById(req, res, next) {
    try {
      const teacher = await teacherService.getTeacherById(req.params.id);
      res.status(200).json(new ApiResponse(200, teacher, 'Teacher details fetched successfully'));
    } catch (error) {
      next(error);
    }
  }

  async updateTeacher(req, res, next) {
    try {
      const teacher = await teacherService.updateTeacher(req.params.id, req.body);
      res.status(200).json(new ApiResponse(200, teacher, 'Teacher updated successfully'));
    } catch (error) {
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((e) => e.message);
        return next(new ApiError(400, `Validation Error: ${messages.join(', ')}`, messages));
      }
      if (error.code === 11000) {
        return next(new ApiError(409, 'Employee ID already exists in the system'));
      }
      next(error);
    }
  }

  async deleteTeacher(req, res, next) {
    try {
      const teacher = await teacherService.deleteTeacher(req.params.id);
      res.status(200).json(new ApiResponse(200, teacher, 'Teacher removed successfully'));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new TeacherController();

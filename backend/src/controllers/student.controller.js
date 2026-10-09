const studentService = require('../services/student.service');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

/**
 * Controller handling Student HTTP requests and formatting responses
 */
class StudentController {
  async createStudent(req, res, next) {
    try {
      const student = await studentService.createStudent(req.body);
      res.status(201).json(new ApiResponse(201, student, 'Student registered successfully'));
    } catch (error) {
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((e) => e.message);
        return next(new ApiError(400, `Validation Error: ${messages.join(', ')}`, messages));
      }
      if (error.code === 11000) {
        return next(new ApiError(409, 'Admission number already exists in the system'));
      }
      next(error);
    }
  }

  async getStudents(req, res, next) {
    try {
      const result = await studentService.getAllStudents(req.query);
      res.status(200).json(new ApiResponse(200, result, 'Students fetched successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getStudentById(req, res, next) {
    try {
      const student = await studentService.getStudentById(req.params.id);
      res.status(200).json(new ApiResponse(200, student, 'Student details fetched successfully'));
    } catch (error) {
      next(error);
    }
  }

  async updateStudent(req, res, next) {
    try {
      const student = await studentService.updateStudent(req.params.id, req.body);
      res.status(200).json(new ApiResponse(200, student, 'Student updated successfully'));
    } catch (error) {
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((e) => e.message);
        return next(new ApiError(400, `Validation Error: ${messages.join(', ')}`, messages));
      }
      if (error.code === 11000) {
        return next(new ApiError(409, 'Admission number already exists in the system'));
      }
      next(error);
    }
  }

  async deleteStudent(req, res, next) {
    try {
      const student = await studentService.deleteStudent(req.params.id);
      res.status(200).json(new ApiResponse(200, student, 'Student removed successfully'));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new StudentController();

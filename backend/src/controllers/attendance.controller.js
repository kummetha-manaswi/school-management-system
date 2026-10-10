const attendanceService = require('../services/attendance.service');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

/**
 * Controller handling Attendance HTTP requests and response formatting
 */
class AttendanceController {
  async markAttendance(req, res, next) {
    try {
      const record = await attendanceService.markAttendance(req.body);
      res.status(201).json(new ApiResponse(201, record, 'Attendance marked successfully'));
    } catch (error) {
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((e) => e.message);
        return next(new ApiError(400, `Validation Error: ${messages.join(', ')}`, messages));
      }
      if (error.code === 11000) {
        return next(
          new ApiError(409, 'Attendance for this student on this date already exists in the system')
        );
      }
      next(error);
    }
  }

  async bulkMarkAttendance(req, res, next) {
    try {
      const result = await attendanceService.bulkMarkAttendance(req.body);
      res.status(201).json(new ApiResponse(201, result, 'Roster attendance recorded successfully'));
    } catch (error) {
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((e) => e.message);
        return next(new ApiError(400, `Validation Error: ${messages.join(', ')}`, messages));
      }
      if (error.code === 11000) {
        return next(
          new ApiError(409, 'One or more students already have attendance recorded on this date')
        );
      }
      next(error);
    }
  }

  async getAttendance(req, res, next) {
    try {
      const result = await attendanceService.getAllAttendance(req.query);
      res.status(200).json(new ApiResponse(200, result, 'Attendance records fetched successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getSummary(req, res, next) {
    try {
      const summary = await attendanceService.getAttendanceSummary(req.query);
      res.status(200).json(new ApiResponse(200, summary, 'Attendance summary fetched successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getAttendanceById(req, res, next) {
    try {
      const record = await attendanceService.getAttendanceById(req.params.id);
      res.status(200).json(new ApiResponse(200, record, 'Attendance details fetched successfully'));
    } catch (error) {
      next(error);
    }
  }

  async updateAttendance(req, res, next) {
    try {
      const record = await attendanceService.updateAttendance(req.params.id, req.body);
      res.status(200).json(new ApiResponse(200, record, 'Attendance updated successfully'));
    } catch (error) {
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((e) => e.message);
        return next(new ApiError(400, `Validation Error: ${messages.join(', ')}`, messages));
      }
      if (error.code === 11000) {
        return next(
          new ApiError(409, 'Another attendance record already exists for this student on this date')
        );
      }
      next(error);
    }
  }
}

module.exports = new AttendanceController();

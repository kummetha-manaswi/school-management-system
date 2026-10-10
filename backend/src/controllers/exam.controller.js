const examService = require('../services/exam.service');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

/**
 * Controller handling Exam and ExamResult HTTP endpoints
 */
class ExamController {
  async createExam(req, res, next) {
    try {
      const exam = await examService.createExam(req.body);
      res.status(201).json(new ApiResponse(201, exam, 'Exam created successfully'));
    } catch (error) {
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((e) => e.message);
        return next(new ApiError(400, `Validation Error: ${messages.join(', ')}`, messages));
      }
      next(error);
    }
  }

  async getAllExams(req, res, next) {
    try {
      const result = await examService.getAllExams(req.query);
      res.status(200).json(new ApiResponse(200, result, 'Exams fetched successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getSummary(req, res, next) {
    try {
      const summary = await examService.getExamSummary(req.query);
      res.status(200).json(new ApiResponse(200, summary, 'Exam summary fetched successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getExamById(req, res, next) {
    try {
      const exam = await examService.getExamById(req.params.id);
      res.status(200).json(new ApiResponse(200, exam, 'Exam details fetched successfully'));
    } catch (error) {
      next(error);
    }
  }

  async updateExam(req, res, next) {
    try {
      const exam = await examService.updateExam(req.params.id, req.body);
      res.status(200).json(new ApiResponse(200, exam, 'Exam updated successfully'));
    } catch (error) {
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((e) => e.message);
        return next(new ApiError(400, `Validation Error: ${messages.join(', ')}`, messages));
      }
      next(error);
    }
  }

  async deleteExam(req, res, next) {
    try {
      const exam = await examService.deleteExam(req.params.id);
      res.status(200).json(new ApiResponse(200, exam, 'Exam and associated results removed successfully'));
    } catch (error) {
      next(error);
    }
  }

  async getExamResults(req, res, next) {
    try {
      const result = await examService.getExamResults(req.params.id, req.query);
      res.status(200).json(new ApiResponse(200, result, 'Exam results fetched successfully'));
    } catch (error) {
      next(error);
    }
  }

  async recordStudentResult(req, res, next) {
    try {
      const result = await examService.recordStudentResult(req.params.id, req.body);
      res.status(201).json(new ApiResponse(201, result, 'Student result recorded successfully'));
    } catch (error) {
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((e) => e.message);
        return next(new ApiError(400, `Validation Error: ${messages.join(', ')}`, messages));
      }
      if (error.code === 11000) {
        return next(new ApiError(409, 'Result for this student on this exam already exists'));
      }
      next(error);
    }
  }

  async bulkRecordResults(req, res, next) {
    try {
      const result = await examService.bulkRecordResults(req.params.id, req.body);
      res.status(201).json(new ApiResponse(201, result, 'Class results recorded successfully'));
    } catch (error) {
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map((e) => e.message);
        return next(new ApiError(400, `Validation Error: ${messages.join(', ')}`, messages));
      }
      if (error.code === 11000) {
        return next(new ApiError(409, 'One or more students already have recorded results on this exam'));
      }
      next(error);
    }
  }

  async getExamStatistics(req, res, next) {
    try {
      const stats = await examService.getExamStatistics(req.params.id);
      res.status(200).json(new ApiResponse(200, stats, 'Exam performance statistics fetched successfully'));
    } catch (error) {
      next(error);
    }
  }

  async updateResult(req, res, next) {
    try {
      const result = await examService.updateResult(req.params.id, req.params.resultId, req.body);
      res.status(200).json(new ApiResponse(200, result, 'Student result updated successfully'));
    } catch (error) {
      next(error);
    }
  }

  async deleteResult(req, res, next) {
    try {
      const result = await examService.deleteResult(req.params.id, req.params.resultId);
      res.status(200).json(new ApiResponse(200, result, 'Result record removed successfully'));
    } catch (error) {
      next(error);
    }
  }

  async publishExamResults(req, res, next) {
    try {
      const exam = await examService.publishExamResults(req.params.id, req.user?.userId);
      res.status(200).json(new ApiResponse(200, exam, 'Exam results published successfully'));
    } catch (error) {
      next(error);
    }
  }

  async unpublishExamResults(req, res, next) {
    try {
      const exam = await examService.unpublishExamResults(req.params.id);
      res.status(200).json(new ApiResponse(200, exam, 'Exam results unpublished successfully'));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ExamController();

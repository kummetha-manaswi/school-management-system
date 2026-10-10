import api from './api';

/**
 * Service for Exam and Result API interactions using centralized Axios client
 */
export const examService = {
  /**
   * Fetch all exams with optional filters and search
   */
  getExams: async (params = {}) => {
    const response = await api.get('/academic/exams', { params });
    return response.data;
  },

  /**
   * Fetch exam summary metrics
   */
  getExamSummary: async (params = {}) => {
    const response = await api.get('/academic/exams/summary', { params });
    return response.data;
  },

  /**
   * Fetch single exam by ID
   */
  getExamById: async (id) => {
    const response = await api.get(`/academic/exams/${id}`);
    return response.data;
  },

  /**
   * Create a new exam
   */
  createExam: async (examData) => {
    const response = await api.post('/academic/exams', examData);
    return response.data;
  },

  /**
   * Update exam by ID
   */
  updateExam: async (id, examData) => {
    const response = await api.put(`/academic/exams/${id}`, examData);
    return response.data;
  },

  /**
   * Delete exam and associated results
   */
  deleteExam: async (id) => {
    const response = await api.delete(`/academic/exams/${id}`);
    return response.data;
  },

  /**
   * Fetch results for an exam
   */
  getExamResults: async (id, params = {}) => {
    const response = await api.get(`/academic/exams/${id}/results`, { params });
    return response.data;
  },

  /**
   * Record single student result
   */
  recordResult: async (id, resultData) => {
    const response = await api.post(`/academic/exams/${id}/results`, resultData);
    return response.data;
  },

  /**
   * Bulk record results for class roster with conflict handling
   */
  bulkRecordResults: async (id, payload) => {
    const response = await api.post(`/academic/exams/${id}/results/bulk`, payload);
    return response.data;
  },

  /**
   * Fetch performance analytics and grade distribution for an exam
   */
  getExamStatistics: async (id) => {
    const response = await api.get(`/academic/exams/${id}/statistics`);
    return response.data;
  },

  /**
   * Update single result record
   */
  updateResult: async (examId, resultId, resultData) => {
    const response = await api.put(`/academic/exams/${examId}/results/${resultId}`, resultData);
    return response.data;
  },

  /**
   * Delete single result record
   */
  deleteResult: async (examId, resultId) => {
    const response = await api.delete(`/academic/exams/${examId}/results/${resultId}`);
    return response.data;
  },

  /**
   * Explicitly publish exam results (Admin only)
   */
  publishExamResults: async (id) => {
    const response = await api.patch(`/academic/exams/${id}/publish`);
    return response.data;
  },

  /**
   * Explicitly unpublish exam results (Admin only)
   */
  unpublishExamResults: async (id) => {
    const response = await api.patch(`/academic/exams/${id}/unpublish`);
    return response.data;
  },
};

export default examService;

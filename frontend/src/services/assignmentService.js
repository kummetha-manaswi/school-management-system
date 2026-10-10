import api from './api';

/**
 * Service for Assignment API interactions using the centralized Axios client
 */
export const assignmentService = {
  /**
   * Fetch all assignments with optional search and filters
   */
  getAssignments: async (params = {}) => {
    const response = await api.get('/academic/assignments', { params });
    return response.data;
  },

  /**
   * Fetch assignment summary counts
   */
  getAssignmentSummary: async (params = {}) => {
    const response = await api.get('/academic/assignments/summary', { params });
    return response.data;
  },

  /**
   * Fetch single assignment by ID
   */
  getAssignmentById: async (id) => {
    const response = await api.get(`/academic/assignments/${id}`);
    return response.data;
  },

  /**
   * Create a new assignment
   */
  createAssignment: async (assignmentData) => {
    const response = await api.post('/academic/assignments', assignmentData);
    return response.data;
  },

  /**
   * Update assignment by ID
   */
  updateAssignment: async (id, assignmentData) => {
    const response = await api.put(`/academic/assignments/${id}`, assignmentData);
    return response.data;
  },

  /**
   * Delete assignment by ID
   */
  deleteAssignment: async (id) => {
    const response = await api.delete(`/academic/assignments/${id}`);
    return response.data;
  },
};

export default assignmentService;

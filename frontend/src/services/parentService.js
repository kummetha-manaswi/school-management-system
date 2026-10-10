import api from './api';

/**
 * Service for Parent and Parent-Student Relationship API interactions
 * using the centralized Axios client.
 */
export const parentService = {
  /**
   * Fetch all parent accounts with optional search and status filters
   */
  getParents: async (params = {}) => {
    const response = await api.get('/academic/parents', { params });
    return response.data;
  },

  /**
   * Fetch single parent details with linked students
   */
  getParentById: async (id) => {
    const response = await api.get(`/academic/parents/${id}`);
    return response.data;
  },

  /**
   * Create a new parent account (Admin only)
   */
  createParent: async (parentData) => {
    const response = await api.post('/academic/parents', parentData);
    return response.data;
  },

  /**
   * Update parent account
   */
  updateParent: async (id, parentData) => {
    const response = await api.put(`/academic/parents/${id}`, parentData);
    return response.data;
  },

  /**
   * Update parent account status (active, inactive, suspended)
   */
  updateParentStatus: async (id, status) => {
    const response = await api.patch(`/academic/parents/${id}/status`, { status });
    return response.data;
  },

  /**
   * Link a student to a parent
   */
  linkStudent: async (parentId, data) => {
    const response = await api.post(`/academic/parents/${parentId}/students`, data);
    return response.data;
  },

  /**
   * Get all linked students for a parent
   */
  getLinkedStudents: async (parentId) => {
    const response = await api.get(`/academic/parents/${parentId}/students`);
    return response.data;
  },

  /**
   * Get all linked parents for a student
   */
  getLinkedParents: async (studentId) => {
    const response = await api.get(`/academic/students/${studentId}/parents`);
    return response.data;
  },

  /**
   * Verify relationship link (Admin only)
   */
  verifyRelationship: async (relationshipId) => {
    const response = await api.patch(`/academic/parent-students/${relationshipId}/verify`);
    return response.data;
  },

  /**
   * Revoke relationship link (Admin only)
   */
  revokeRelationship: async (relationshipId, reason = '') => {
    const response = await api.patch(`/academic/parent-students/${relationshipId}/revoke`, { reason });
    return response.data;
  },
};

export default parentService;

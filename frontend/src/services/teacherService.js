import api from './api';

/**
 * Service for Teacher API interactions using the centralized Axios client
 */
export const teacherService = {
  /**
   * Fetch all teachers with optional search & filters
   */
  getTeachers: async (params = {}) => {
    const response = await api.get('/academic/teachers', { params });
    return response.data;
  },

  /**
   * Fetch single teacher by ID
   */
  getTeacherById: async (id) => {
    const response = await api.get(`/academic/teachers/${id}`);
    return response.data;
  },

  /**
   * Register a new teacher
   */
  createTeacher: async (teacherData) => {
    const response = await api.post('/academic/teachers', teacherData);
    return response.data;
  },

  /**
   * Update teacher by ID
   */
  updateTeacher: async (id, teacherData) => {
    const response = await api.put(`/academic/teachers/${id}`, teacherData);
    return response.data;
  },

  /**
   * Delete teacher by ID
   */
  deleteTeacher: async (id) => {
    const response = await api.delete(`/academic/teachers/${id}`);
    return response.data;
  },
};

export default teacherService;

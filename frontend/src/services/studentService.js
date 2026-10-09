import api from './api';

/**
 * Service for Student API interactions using the centralized Axios client
 */
export const studentService = {
  /**
   * Fetch all students with optional search & filters
   */
  getStudents: async (params = {}) => {
    const response = await api.get('/academic/students', { params });
    return response.data;
  },

  /**
   * Fetch single student by ID
   */
  getStudentById: async (id) => {
    const response = await api.get(`/academic/students/${id}`);
    return response.data;
  },

  /**
   * Register a new student
   */
  createStudent: async (studentData) => {
    const response = await api.post('/academic/students', studentData);
    return response.data;
  },

  /**
   * Update student by ID
   */
  updateStudent: async (id, studentData) => {
    const response = await api.put(`/academic/students/${id}`, studentData);
    return response.data;
  },

  /**
   * Delete student by ID
   */
  deleteStudent: async (id) => {
    const response = await api.delete(`/academic/students/${id}`);
    return response.data;
  },
};

export default studentService;

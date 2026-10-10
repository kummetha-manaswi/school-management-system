import api from './api';

/**
 * Service for Attendance API interactions using the centralized Axios client
 */
export const attendanceService = {
  /**
   * Fetch attendance records with optional filters (date, className, section, status, studentId)
   */
  getAttendance: async (params = {}) => {
    const response = await api.get('/academic/attendance', { params });
    return response.data;
  },

  /**
   * Fetch attendance summary counts (total, present, absent, late, excused, attendanceRate)
   */
  getAttendanceSummary: async (params = {}) => {
    const response = await api.get('/academic/attendance/summary', { params });
    return response.data;
  },

  /**
   * Fetch single attendance record by ID
   */
  getAttendanceById: async (id) => {
    const response = await api.get(`/academic/attendance/${id}`);
    return response.data;
  },

  /**
   * Mark attendance for a single student
   */
  markAttendance: async (attendanceData) => {
    const response = await api.post('/academic/attendance', attendanceData);
    return response.data;
  },

  /**
   * Bulk mark/save attendance for a class roster
   */
  bulkMarkAttendance: async (payload) => {
    const response = await api.post('/academic/attendance/bulk', payload);
    return response.data;
  },

  /**
   * Update attendance record by ID
   */
  updateAttendance: async (id, updateData) => {
    const response = await api.put(`/academic/attendance/${id}`, updateData);
    return response.data;
  },
};

export default attendanceService;

import api from './api';

export const authService = {
  /**
   * Log in staff member (admin or teacher)
   * @param {Object} credentials - { email, password }
   * @returns {Promise<Object>} { success, message, data: { user, token } }
   */
  async loginStaff({ email, password }) {
    const response = await api.post('/auth/staff/login', { email, password });
    return response.data;
  },

  /**
   * Fetch current authenticated staff profile
   * @returns {Promise<Object>} { success, data: user }
   */
  async getProfile() {
    const response = await api.get('/auth/staff/me');
    return response.data;
  },
};

export default authService;

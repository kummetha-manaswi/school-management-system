import api from './api';

/**
 * Service for Teacher Notes API interactions using centralized Axios client
 */
export const noteService = {
  /**
   * Fetch all notes with optional search, category, student, teacher, date filters, and pagination
   */
  getNotes: async (params = {}) => {
    const response = await api.get('/academic/notes', { params });
    return response.data;
  },

  /**
   * Fetch notes summary breakdown by category
   */
  getNoteSummary: async (params = {}) => {
    const response = await api.get('/academic/notes/summary', { params });
    return response.data;
  },

  /**
   * Fetch single note by ID
   */
  getNoteById: async (id) => {
    const response = await api.get(`/academic/notes/${id}`);
    return response.data;
  },

  /**
   * Create a new note
   */
  createNote: async (noteData) => {
    const response = await api.post('/academic/notes', noteData);
    return response.data;
  },

  /**
   * Update note by ID
   */
  updateNote: async (id, noteData) => {
    const response = await api.put(`/academic/notes/${id}`, noteData);
    return response.data;
  },

  /**
   * Delete note by ID
   */
  deleteNote: async (id) => {
    const response = await api.delete(`/academic/notes/${id}`);
    return response.data;
  },
};

export default noteService;

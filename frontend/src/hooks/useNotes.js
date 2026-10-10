import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import noteService from '../services/noteService';

/**
 * Hook to fetch notes with filters, search, and pagination
 */
export const useNotes = (filters = {}) => {
  return useQuery({
    queryKey: ['notes', filters],
    queryFn: () => noteService.getNotes(filters),
    select: (data) =>
      data?.data || {
        notes: [],
        total: 0,
        page: 1,
        totalPages: 0,
      },
  });
};

/**
 * Hook to fetch note summary breakdown by category
 */
export const useNoteSummary = (filters = {}) => {
  return useQuery({
    queryKey: ['note-summary', filters],
    queryFn: () => noteService.getNoteSummary(filters),
    select: (data) =>
      data?.data || {
        total: 0,
        academic_progress: 0,
        classroom_participation: 0,
        behavior: 0,
        general_observation: 0,
      },
  });
};

/**
 * Hook to fetch single note by ID
 */
export const useNote = (id) => {
  return useQuery({
    queryKey: ['note', id],
    queryFn: () => noteService.getNoteById(id),
    select: (data) => data?.data,
    enabled: Boolean(id),
  });
};

/**
 * Hook to create a new note
 */
export const useCreateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newNote) => noteService.createNote(newNote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['note-summary'] });
    },
  });
};

/**
 * Hook to update an existing note
 */
export const useUpdateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => noteService.updateNote(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['note-summary'] });
      queryClient.invalidateQueries({ queryKey: ['note', variables.id] });
    },
  });
};

/**
 * Hook to delete a note
 */
export const useDeleteNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => noteService.deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['note-summary'] });
    },
  });
};

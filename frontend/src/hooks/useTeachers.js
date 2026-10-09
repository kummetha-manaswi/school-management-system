import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import teacherService from '../services/teacherService';

/**
 * Hook to fetch teachers with filters and search
 */
export const useTeachers = (filters = {}) => {
  return useQuery({
    queryKey: ['teachers', filters],
    queryFn: () => teacherService.getTeachers(filters),
    select: (data) => data?.data || { teachers: [], total: 0 },
  });
};

/**
 * Hook to fetch a single teacher by ID
 */
export const useTeacher = (id) => {
  return useQuery({
    queryKey: ['teacher', id],
    queryFn: () => teacherService.getTeacherById(id),
    select: (data) => data?.data,
    enabled: Boolean(id),
  });
};

/**
 * Hook to create a teacher
 */
export const useCreateTeacher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newTeacher) => teacherService.createTeacher(newTeacher),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
    },
  });
};

/**
 * Hook to update a teacher
 */
export const useUpdateTeacher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => teacherService.updateTeacher(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
      queryClient.invalidateQueries({ queryKey: ['teacher', variables.id] });
    },
  });
};

/**
 * Hook to delete a teacher
 */
export const useDeleteTeacher = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => teacherService.deleteTeacher(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teachers'] });
    },
  });
};

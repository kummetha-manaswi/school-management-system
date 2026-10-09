import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import studentService from '../services/studentService';

/**
 * Hook to fetch students with filters and search
 */
export const useStudents = (filters = {}) => {
  return useQuery({
    queryKey: ['students', filters],
    queryFn: () => studentService.getStudents(filters),
    select: (data) => data?.data || { students: [], total: 0 },
  });
};

/**
 * Hook to fetch a single student by ID
 */
export const useStudent = (id) => {
  return useQuery({
    queryKey: ['student', id],
    queryFn: () => studentService.getStudentById(id),
    select: (data) => data?.data,
    enabled: Boolean(id),
  });
};

/**
 * Hook to create a student
 */
export const useCreateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newStudent) => studentService.createStudent(newStudent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
};

/**
 * Hook to update a student
 */
export const useUpdateStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => studentService.updateStudent(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['student', variables.id] });
    },
  });
};

/**
 * Hook to delete a student
 */
export const useDeleteStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => studentService.deleteStudent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
};

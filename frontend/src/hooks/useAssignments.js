import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import assignmentService from '../services/assignmentService';

/**
 * Hook to fetch assignments with filters and search
 */
export const useAssignments = (filters = {}) => {
  return useQuery({
    queryKey: ['assignments', filters],
    queryFn: () => assignmentService.getAssignments(filters),
    select: (data) => data?.data || { assignments: [], total: 0 },
  });
};

/**
 * Hook to fetch assignment summary counts
 */
export const useAssignmentSummary = (filters = {}) => {
  return useQuery({
    queryKey: ['assignment-summary', filters],
    queryFn: () => assignmentService.getAssignmentSummary(filters),
    select: (data) =>
      data?.data || {
        total: 0,
        published: 0,
        overdue: 0,
        completed: 0,
        draft: 0,
        archived: 0,
      },
  });
};

/**
 * Hook to fetch single assignment by ID
 */
export const useAssignment = (id) => {
  return useQuery({
    queryKey: ['assignment', id],
    queryFn: () => assignmentService.getAssignmentById(id),
    select: (data) => data?.data,
    enabled: Boolean(id),
  });
};

/**
 * Hook to create an assignment
 */
export const useCreateAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newAssignment) => assignmentService.createAssignment(newAssignment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['assignment-summary'] });
    },
  });
};

/**
 * Hook to update an assignment
 */
export const useUpdateAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => assignmentService.updateAssignment(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['assignment-summary'] });
      queryClient.invalidateQueries({ queryKey: ['assignment', variables.id] });
    },
  });
};

/**
 * Hook to delete an assignment
 */
export const useDeleteAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => assignmentService.deleteAssignment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      queryClient.invalidateQueries({ queryKey: ['assignment-summary'] });
    },
  });
};

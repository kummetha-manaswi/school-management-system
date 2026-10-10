import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import parentService from '../services/parentService';

/**
 * Hook to fetch parents with filters and search
 */
export const useParents = (filters = {}) => {
  return useQuery({
    queryKey: ['parents', filters],
    queryFn: () => parentService.getParents(filters),
    select: (data) => data?.data || { parents: [], total: 0 },
  });
};

/**
 * Hook to fetch single parent by ID
 */
export const useParent = (id) => {
  return useQuery({
    queryKey: ['parent', id],
    queryFn: () => parentService.getParentById(id),
    select: (data) => data?.data,
    enabled: Boolean(id),
  });
};

/**
 * Hook to create a parent account
 */
export const useCreateParent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newParent) => parentService.createParent(newParent),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parents'] });
    },
  });
};

/**
 * Hook to update parent details
 */
export const useUpdateParent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => parentService.updateParent(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['parents'] });
      queryClient.invalidateQueries({ queryKey: ['parent', variables.id] });
    },
  });
};

/**
 * Hook to update parent account status
 */
export const useUpdateParentStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => parentService.updateParentStatus(id, status),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['parents'] });
      queryClient.invalidateQueries({ queryKey: ['parent', variables.id] });
    },
  });
};

/**
 * Hook to link a student to a parent
 */
export const useLinkStudent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ parentId, data }) => parentService.linkStudent(parentId, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['parent', variables.parentId] });
      queryClient.invalidateQueries({ queryKey: ['parents'] });
      queryClient.invalidateQueries({ queryKey: ['student-parents'] });
    },
  });
};

/**
 * Hook to verify relationship link
 */
export const useVerifyRelationship = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (relationshipId) => parentService.verifyRelationship(relationshipId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parent'] });
      queryClient.invalidateQueries({ queryKey: ['parents'] });
      queryClient.invalidateQueries({ queryKey: ['student-parents'] });
    },
  });
};

/**
 * Hook to revoke relationship link
 */
export const useRevokeRelationship = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ relationshipId, reason }) => parentService.revokeRelationship(relationshipId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parent'] });
      queryClient.invalidateQueries({ queryKey: ['parents'] });
      queryClient.invalidateQueries({ queryKey: ['student-parents'] });
    },
  });
};

/**
 * Hook to fetch linked parents for a specific student
 */
export const useStudentParents = (studentId) => {
  return useQuery({
    queryKey: ['student-parents', studentId],
    queryFn: () => parentService.getLinkedParents(studentId),
    select: (data) => data?.data || [],
    enabled: Boolean(studentId),
  });
};

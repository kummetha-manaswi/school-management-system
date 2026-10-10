import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import attendanceService from '../services/attendanceService';

/**
 * Hook to fetch attendance records with filters
 */
export const useAttendance = (filters = {}) => {
  return useQuery({
    queryKey: ['attendance', filters],
    queryFn: () => attendanceService.getAttendance(filters),
    select: (data) => data?.data || { attendance: [], total: 0 },
  });
};

/**
 * Hook to fetch attendance summary counts and rate
 */
export const useAttendanceSummary = (filters = {}) => {
  return useQuery({
    queryKey: ['attendance-summary', filters],
    queryFn: () => attendanceService.getAttendanceSummary(filters),
    select: (data) =>
      data?.data || {
        total: 0,
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
        attendanceRate: 0,
      },
  });
};

/**
 * Hook to fetch a single attendance record by ID
 */
export const useAttendanceRecord = (id) => {
  return useQuery({
    queryKey: ['attendance-record', id],
    queryFn: () => attendanceService.getAttendanceById(id),
    select: (data) => data?.data,
    enabled: Boolean(id),
  });
};

/**
 * Hook to mark attendance for a single student
 */
export const useMarkAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => attendanceService.markAttendance(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-summary'] });
    },
  });
};

/**
 * Hook to bulk mark attendance for a roster
 */
export const useBulkMarkAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => attendanceService.bulkMarkAttendance(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-summary'] });
    },
  });
};

/**
 * Hook to update an existing attendance record
 */
export const useUpdateAttendance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => attendanceService.updateAttendance(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-summary'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-record', variables.id] });
    },
  });
};

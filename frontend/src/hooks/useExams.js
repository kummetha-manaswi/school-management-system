import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import examService from '../services/examService';

/**
 * Hook to fetch exams with filters and search
 */
export const useExams = (filters = {}) => {
  return useQuery({
    queryKey: ['exams', filters],
    queryFn: () => examService.getExams(filters),
    select: (data) => data?.data || { exams: [], total: 0 },
  });
};

/**
 * Hook to fetch exam summary metrics
 */
export const useExamSummary = (filters = {}) => {
  return useQuery({
    queryKey: ['exam-summary', filters],
    queryFn: () => examService.getExamSummary(filters),
    select: (data) =>
      data?.data || {
        total: 0,
        scheduled: 0,
        ongoing: 0,
        completed: 0,
        cancelled: 0,
      },
  });
};

/**
 * Hook to fetch single exam by ID
 */
export const useExam = (id) => {
  return useQuery({
    queryKey: ['exam', id],
    queryFn: () => examService.getExamById(id),
    select: (data) => data?.data,
    enabled: Boolean(id),
  });
};

/**
 * Hook to create an exam
 */
export const useCreateExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newExam) => examService.createExam(newExam),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      queryClient.invalidateQueries({ queryKey: ['exam-summary'] });
    },
  });
};

/**
 * Hook to update an exam
 */
export const useUpdateExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => examService.updateExam(id, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      queryClient.invalidateQueries({ queryKey: ['exam-summary'] });
      queryClient.invalidateQueries({ queryKey: ['exam', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['exam-results', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['exam-statistics', variables.id] });
    },
  });
};

/**
 * Hook to delete an exam
 */
export const useDeleteExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => examService.deleteExam(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      queryClient.invalidateQueries({ queryKey: ['exam-summary'] });
    },
  });
};

/**
 * Hook to fetch results of an exam
 */
export const useExamResults = (id, filters = {}) => {
  return useQuery({
    queryKey: ['exam-results', id, filters],
    queryFn: () => examService.getExamResults(id, filters),
    select: (data) => data?.data || { results: [], total: 0, exam: null },
    enabled: Boolean(id),
  });
};

/**
 * Hook to fetch performance analytics for an exam
 */
export const useExamStatistics = (id) => {
  return useQuery({
    queryKey: ['exam-statistics', id],
    queryFn: () => examService.getExamStatistics(id),
    select: (data) => data?.data,
    enabled: Boolean(id),
  });
};

/**
 * Hook to bulk record/correct results for an exam
 */
export const useBulkRecordResults = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }) => examService.bulkRecordResults(id, payload),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['exam-results', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['exam-statistics', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['exams'] });
    },
  });
};

/**
 * Hook to update single student result
 */
export const useUpdateResult = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ examId, resultId, data }) => examService.updateResult(examId, resultId, data),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['exam-results', variables.examId] });
      queryClient.invalidateQueries({ queryKey: ['exam-statistics', variables.examId] });
    },
  });
};

/**
 * Hook to delete single student result
 */
export const useDeleteResult = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ examId, resultId }) => examService.deleteResult(examId, resultId),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['exam-results', variables.examId] });
      queryClient.invalidateQueries({ queryKey: ['exam-statistics', variables.examId] });
    },
  });
};

/**
 * Hook to publish exam results
 */
export const usePublishExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (examId) => examService.publishExamResults(examId),
    onSuccess: (response, examId) => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      queryClient.invalidateQueries({ queryKey: ['exam', examId] });
      queryClient.invalidateQueries({ queryKey: ['exam-summary'] });
    },
  });
};

/**
 * Hook to unpublish exam results
 */
export const useUnpublishExam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (examId) => examService.unpublishExamResults(examId),
    onSuccess: (response, examId) => {
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      queryClient.invalidateQueries({ queryKey: ['exam', examId] });
      queryClient.invalidateQueries({ queryKey: ['exam-summary'] });
    },
  });
};

import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export const useHealthCheck = () => {
  return useQuery({
    queryKey: ['system-health'],
    queryFn: async () => {
      const response = await api.get('/health');
      return response.data;
    },
    retry: 1,
    refetchInterval: 30000,
  });
};

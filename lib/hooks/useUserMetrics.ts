'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchUserMetrics } from '../api/metrics';

export function useUserMetrics(semester?: 1 | 2) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['user-metrics', semester ?? null],
    queryFn: () => fetchUserMetrics(semester),
  });
  return { metrics: data ?? null, isLoading, isError, refetch };
}

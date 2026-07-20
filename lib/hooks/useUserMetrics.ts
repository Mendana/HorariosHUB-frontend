'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchUserMetrics, fetchUserMetricsWeekly } from '../api/metrics';

export function useUserMetrics(semester?: 1 | 2) {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['user-metrics', semester ?? null],
    queryFn: () => fetchUserMetrics(semester),
  });
  return { metrics: data ?? null, isLoading, isError, refetch };
}

export function useUserMetricsWeekly(semester?: 1 | 2) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['user-metrics-weekly', semester ?? null],
    queryFn: () => fetchUserMetricsWeekly(semester),
  });
  return { weeks: data ?? [], isLoading, isError };
}

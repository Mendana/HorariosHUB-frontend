'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchScheduleForMonth } from '../api/schedule';
import { getErrorMessage } from '../errors';

export function useScheduleMonth(
  identifier: string | null,
  month: string, // "YYYY-MM"
  enabled: boolean,
) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['schedule-month', identifier, month],
    queryFn: () => fetchScheduleForMonth(identifier!, month),
    enabled: enabled && !!identifier,
    staleTime: 5 * 60 * 1000,
  });

  return {
    subjects: data?.subjects ?? [],
    isLoading,
    error: error ? getErrorMessage(error) : null,
  };
}

'use client';

import { useState, useEffect } from 'react';
import type { Subject } from '../types/schedule';
import { MOCK_SUBJECTS } from '../mock/schedule';

interface UseScheduleResult {
  subjects: Subject[];
  isLoading: boolean;
  error: string | null;
}

export function useSchedule(identifier: string | null): UseScheduleResult {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!identifier) {
      setSubjects([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Simulate network delay so the skeleton is visible
    const timer = setTimeout(() => {
      setSubjects(MOCK_SUBJECTS);
      setIsLoading(false);
    }, 400);

    return () => clearTimeout(timer);

    // ── Real implementation (TanStack Query) ──────────────────────────────────
    // const { data, isLoading, error } = useQuery({
    //   queryKey: ['schedule', identifier],
    //   queryFn: () => fetchSchedule(identifier),
    //   enabled: !!identifier,
    //   staleTime: 5 * 60 * 1000,
    // });
    // return { subjects: data?.subjects ?? [], isLoading, error: error?.message ?? null };
  }, [identifier]); // Re-runs only when identifier changes — rule 15 (no duplicate fetches)

  return { subjects, isLoading, error };
}

'use client';

import { createContext, useState, useEffect, useCallback } from 'react';
import type { Subject } from '../types/schedule';
import { MOCK_SUBJECTS } from '../mock/schedule';

// Context so deep components (e.g. SubjectPopover) can trigger a schedule refresh
// without prop-drilling through ScheduleGrid → SubjectBlock.
export const ScheduleRefreshContext = createContext<() => void>(() => {});

interface UseScheduleResult {
  subjects: Subject[];
  isLoading: boolean;
  error: string | null;
  refreshSchedule: () => void;
}

export function useSchedule(identifier: string | null): UseScheduleResult {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Incrementing this counter re-triggers the effect without changing identifier
  const [version, setVersion] = useState(0);

  const refreshSchedule = useCallback(() => setVersion(v => v + 1), []);

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
    // To refresh after an edit or delete:
    //   queryClient.invalidateQueries({ queryKey: ['schedule'] });
    // return { subjects: data?.subjects ?? [], isLoading, error: error?.message ?? null, refreshSchedule };
  }, [identifier, version]); // `version` re-triggers the fetch on demand (rule 15 compatible)

  return { subjects, isLoading, error, refreshSchedule };
}

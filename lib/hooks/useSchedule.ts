/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import { createContext, useState, useEffect, useCallback } from 'react';
import type { Subject } from '../types/schedule';
import { MOCK_SUBJECTS } from '../mock/schedule';
import { getErrorMessage } from '../errors';
import { MOCKS } from '../config/mocks';

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
  if (MOCKS.schedule) {
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
        try {
          setSubjects(MOCK_SUBJECTS);
          setIsLoading(false);
        } catch (err) {
          setError(getErrorMessage(err));
          setIsLoading(false);
        }
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
      // error: error ? getErrorMessage(error) : null
      // return { subjects: data?.subjects ?? [], isLoading, error: ..., refreshSchedule };
    }, [identifier, version]); // `version` re-triggers the fetch on demand (rule 15 compatible)

    return { subjects, isLoading, error, refreshSchedule };
  }

  // ── Real implementation — descomentar cuando MOCKS.schedule = false ────────
  // import { useQuery, useQueryClient } from '@tanstack/react-query';
  // import { apiFetch } from '@/lib/apiFetch';
  //
  // const queryClient = useQueryClient();
  // const refreshSchedule = useCallback(
  //   () => queryClient.invalidateQueries({ queryKey: ['schedule'] }),
  //   [queryClient],
  // );
  // const { data, isLoading, error } = useQuery({
  //   queryKey: ['schedule', identifier],
  //   queryFn: () => apiFetch<{ subjects: Subject[] }>(`/api/schedule/${identifier}`),
  //   enabled: !!identifier,
  //   staleTime: 5 * 60 * 1000,
  // });
  // return {
  //   subjects: data?.subjects ?? [],
  //   isLoading,
  //   error: error ? getErrorMessage(error) : null,
  //   refreshSchedule,
  // };

  throw new Error('MOCKS.schedule is false pero la implementación real no está conectada. Ver docs/CONNECTING_BACKEND.md');
}

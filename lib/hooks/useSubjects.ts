'use client';

import { useState, useEffect, useCallback } from 'react';
import type { CatalogSubject } from '../types/subjects';
import { MOCK_CATALOG, MOCK_ALL_GROUP_IDS } from '../mock/subjects';
import { getErrorMessage } from '../errors';
import { useToast } from './useToast';

export interface AutoSelectResult {
  groups_selected: number;
  selected_group_ids: string[];
}

export interface UseSubjectsResult {
  subjects: CatalogSubject[];
  isLoading: boolean;
  error: string | null;
  reload: () => void;
  saveSelection: (groups: string[]) => Promise<void>;
  autoSelect: () => Promise<AutoSelectResult>;
}

export function useSubjects(): UseSubjectsResult {
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<CatalogSubject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadTrigger, setLoadTrigger] = useState(0);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const timer = setTimeout(() => {
      try {
        setSubjects(MOCK_CATALOG);
        setIsLoading(false);
      } catch (err) {
        setError(getErrorMessage(err));
        setIsLoading(false);
      }
    }, 400);

    return () => clearTimeout(timer);

    // ── Real implementation (TanStack Query) ──────────────────────────────────
    // const { data, isLoading, error, refetch } = useQuery({
    //   queryKey: ['subjects-catalog'],
    //   queryFn: () => fetcher<SubjectCatalogResponse>('/api/subjects/catalog'),
    //   staleTime: 5 * 60 * 1000,
    // });
    // return {
    //   subjects: data?.subjects ?? [],
    //   isLoading,
    //   error: error ? getErrorMessage(error) : null,
    //   reload: refetch,
    //   saveSelection, autoSelect,
    // };
  }, [loadTrigger]);

  const reload = useCallback(() => setLoadTrigger((t) => t + 1), []);

  // Simulates POST /api/subjects/selection
  // Real: fetcher('/api/subjects/selection', { method: 'POST', body: JSON.stringify({ groups }) })
  const saveSelection = useCallback(async (groups: string[]): Promise<void> => {
    try {
      await new Promise<void>((resolve) => setTimeout(resolve, 600));
      void groups; // used in real implementation
    } catch (err) {
      toast.error(getErrorMessage(err));
      throw err;
    }
  }, [toast]);

  // Simulates POST /api/subjects/auto-select + polling GET /api/subjects/auto-select/status.
  // Real polling interval: 5 s. Mock interval: 1 500 ms per cycle (3 cycles ≈ 4.5 s total).
  const autoSelect = useCallback((): Promise<AutoSelectResult> => {
    return new Promise<AutoSelectResult>((resolve, reject) => {
      // Cycle 1: job starts → still processing
      setTimeout(() => {
        // Cycle 2: poll → still processing
        setTimeout(() => {
          // Cycle 3: poll → completed
          setTimeout(() => {
            try {
              resolve({
                groups_selected: MOCK_ALL_GROUP_IDS.length,
                selected_group_ids: MOCK_ALL_GROUP_IDS,
              });
            } catch (err) {
              toast.error(getErrorMessage(err));
              reject(err);
            }
          }, 1500);
        }, 1500);
      }, 1500);

      // ── Real implementation ──────────────────────────────────────────────────
      // async function run() {
      //   await fetcher('/api/subjects/auto-select', { method: 'POST' });
      //   return new Promise<AutoSelectResult>((res, rej) => {
      //     const id = setInterval(async () => {
      //       try {
      //         const status = await fetcher<AutoSelectStatus>('/api/subjects/auto-select/status');
      //         if (status.status === 'completed') {
      //           clearInterval(id);
      //           reload();
      //           res({ groups_selected: status.groups_selected ?? 0, selected_group_ids: [] });
      //         } else if (status.status === 'failed') {
      //           clearInterval(id);
      //           rej(new Error(status.error ?? 'Auto-select failed'));
      //         }
      //       } catch (err) {
      //         clearInterval(id);
      //         toast.error(getErrorMessage(err));
      //         rej(err);
      //       }
      //     }, 5000);
      //   });
      // }
      // run().then(resolve).catch(reject);
    });
  }, [toast]);

  return { subjects, isLoading, error, reload, saveSelection, autoSelect };
}

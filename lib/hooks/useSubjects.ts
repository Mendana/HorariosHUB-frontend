'use client';

import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage } from '@/lib/errors';
import { fetchCatalog, saveSelection as apiSaveSelection, startAutoSelect, getAutoSelectStatus } from '../api/subjects';
import type { CatalogSubject } from '@/lib/types/subjects';

export interface AutoSelectResult {
  groups_selected: number;
  selected_group_ids: string[];
}

export class AutoSelectFailedError extends Error {
  detail?: string;

  constructor(detail?: string) {
    super('Auto-select failed');
    this.name = 'AutoSelectFailedError';
    this.detail = detail;
  }
}

export interface UseSubjectsResult {
  subjects: CatalogSubject[];
  isLoading: boolean;
  error: string | null;
  reload: () => void;
  saveSelection: (groups: string[]) => Promise<void>;
  autoSelect: () => Promise<AutoSelectResult>;
}

export function useSubjects(enabled: boolean = true): UseSubjectsResult {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['subjects-catalog'],
    queryFn: fetchCatalog,
    staleTime: 5 * 60 * 1000,
    enabled,
  });

  const saveSelection = useCallback(async (groups: string[]) => {
    await apiSaveSelection(groups);
    await queryClient.invalidateQueries({ queryKey: ['subjects-catalog'] });
  }, [queryClient]);

  const autoSelect = useCallback((): Promise<AutoSelectResult> => {
    return new Promise<AutoSelectResult>((resolve, reject) => {
      startAutoSelect().then(() => {
        const intervalId = setInterval(async () => {
          try {
            const status = await getAutoSelectStatus();
            if (status.status === 'completed') {
              clearInterval(intervalId);
              // Refetch catalog to get updated selection, then extract selected IDs
              const catalog = await queryClient.fetchQuery({
                queryKey: ['subjects-catalog'],
                queryFn: fetchCatalog,
                staleTime: 0,
              });
              const selectedIds = catalog.subjects.flatMap(
                (s) => s.groups.filter((g) => g.selected).map((g) => g.id),
              );
              resolve({
                groups_selected: status.groups_selected ?? selectedIds.length,
                selected_group_ids: selectedIds,
              });
            } else if (status.status === 'failed') {
              clearInterval(intervalId);
              reject(new AutoSelectFailedError(status.error ?? undefined));
            }
          } catch (err) {
            clearInterval(intervalId);
            reject(err);
          }
        }, 5000);
      }).catch(reject);
    });
  }, [queryClient]);

  return {
    subjects: data?.subjects ?? [],
    isLoading,
    error: error ? getErrorMessage(error) : null,
    reload: () => { void refetch(); },
    saveSelection,
    autoSelect,
  };
}

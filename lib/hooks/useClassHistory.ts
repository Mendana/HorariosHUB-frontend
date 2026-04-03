/* eslint-disable react-hooks/rules-of-hooks */
'use client';

import { useState, useEffect } from 'react';
import type { ChangeRecord } from '@/lib/types/proposals';
import { MOCK_CLASS_HISTORY } from '@/lib/mock/proposals';
import { MOCKS } from '@/lib/config/mocks';

export interface UseClassHistoryResult {
  history: ChangeRecord[];
  isLoading: boolean;
  error: string | null;
}

export function useClassHistory(classId: string): UseClassHistoryResult {
  if (MOCKS.proposals) {
    const [history, setHistory] = useState<ChangeRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error] = useState<string | null>(null);

    useEffect(() => {
      setIsLoading(true);
      const t = setTimeout(() => {
        const filtered = MOCK_CLASS_HISTORY
          .filter((r) => r.classId === classId)
          .sort((a, b) => b.approvedAt.localeCompare(a.approvedAt));
        setHistory(filtered);
        setIsLoading(false);
      }, 300);
      return () => clearTimeout(t);
    }, [classId]);

    return { history, isLoading, error };
  }

  // ── Real implementation — descomentar cuando MOCKS.proposals = false ──────
  // import { useQuery } from '@tanstack/react-query';
  // import { apiFetch } from '@/lib/apiFetch';
  //
  // const { data, isLoading, error } = useQuery({
  //   queryKey: ['history', classId],
  //   queryFn: () => apiFetch<{ data: ChangeRecord[] }>(`/api/classes/${classId}/history`),
  // });
  // return {
  //   history: data?.data ?? [],
  //   isLoading,
  //   error: error ? getErrorMessage(error) : null,
  // };

  throw new Error('MOCKS.proposals is false pero la implementación real no está conectada.');
}

'use client';

import { useState, useEffect } from 'react';
import type { ChangeRecord } from '@/lib/types/proposals';
import { MOCK_CLASS_HISTORY } from '@/lib/mock/proposals';

export interface UseClassHistoryResult {
  history: ChangeRecord[];
  isLoading: boolean;
  error: string | null;
}

export function useClassHistory(classId: string): UseClassHistoryResult {
  const [history, setHistory] = useState<ChangeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const t = setTimeout(() => {
      const filtered = MOCK_CLASS_HISTORY
        .filter((r) => r.classId === classId)
        .sort((a, b) =>
          (b.approvedAt ?? b.createdAt).localeCompare(a.approvedAt ?? a.createdAt)
        );
      setHistory(filtered);
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [classId]);

  return { history, isLoading, error: null };
}

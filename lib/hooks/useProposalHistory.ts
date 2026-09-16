'use client';

import { useQuery } from '@tanstack/react-query';
import type { Proposal, ProposalHistoryStatusFilter } from '@/lib/types/proposals';
import { fetchProposalHistory } from '@/lib/api/proposals';
import { getErrorMessage } from '@/lib/errors';

export interface UseProposalHistoryResult {
  proposals: Proposal[];
  total: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useProposalHistory(
  status: ProposalHistoryStatusFilter,
  page: number,
  limit: number,
): UseProposalHistoryResult {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['proposal-history', status, page, limit],
    queryFn: () => fetchProposalHistory({ status, page, limit }),
    staleTime: 2 * 60 * 1000,
  });

  return {
    proposals: data?.data ?? [],
    total: data?.total ?? 0,
    isLoading,
    error: error ? getErrorMessage(error) : null,
    refetch: () => { void refetch(); },
  };
}

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Proposal, ProposalStatusFilter } from '@/lib/types/proposals';
import { fetchProposals, fetchMyProposals, approveProposal, rejectProposal } from '@/lib/api/proposals';
import { getErrorMessage } from '@/lib/errors';
import { useToast } from '@/lib/hooks/useToast';

const PAGE_SIZE = 10;

export interface UseProposalsResult {
  proposals: Proposal[];
  total: number;
  isLoading: boolean;
  error: string | null;
  approve: (id: string) => Promise<void>;
  reject: (id: string) => Promise<void>;
}

export function useProposals(
  endpoint: 'mine' | 'all',
  status: ProposalStatusFilter,
  page: number,
): UseProposalsResult {
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['proposals', endpoint, status, page],
    queryFn: () =>
      endpoint === 'mine'
        ? fetchMyProposals({ page, limit: PAGE_SIZE })
        : fetchProposals({ status, page, limit: PAGE_SIZE }),
    staleTime: 2 * 60 * 1000,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['proposals'] });

  const approveMutation = useMutation({
    mutationFn: (id: string) => approveProposal(id),
    onSuccess: invalidate,
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => rejectProposal(id),
    onSuccess: invalidate,
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return {
    proposals: data?.data ?? [],
    total: data?.total ?? 0,
    isLoading,
    error: error ? getErrorMessage(error) : null,
    approve: async (id) => { await approveMutation.mutateAsync(id); },
    reject: async (id) => { await rejectMutation.mutateAsync(id); },
  };
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Proposal, ProposalStatus } from '@/lib/types/proposals';
import { MOCK_PROPOSALS } from '@/lib/mock/proposals';
import { getErrorMessage } from '@/lib/errors';
import { useToast } from '@/lib/hooks/useToast';

// ── Real implementation (TanStack Query) ──────────────────────────────────────
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { apiFetch } from '@/lib/apiFetch';
//
// export function useProposals(endpoint: 'mine' | 'all', status: ProposalStatus | 'all', page: number) {
//   const qc = useQueryClient();
//   const { data, isLoading, error } = useQuery({
//     queryKey: ['proposals', endpoint, status, page],
//     queryFn: () => {
//       const url = endpoint === 'mine'
//         ? `/api/proposals/mine?page=${page}&limit=10`
//         : `/api/proposals?status=${status}&page=${page}&limit=10`;
//       return apiFetch<ProposalsResponse>(url);
//     },
//   });
//   const approveMutation = useMutation({
//     mutationFn: (id: string) => apiFetch(`/api/proposals/${id}/approve`, { method: 'PATCH' }),
//     onSuccess: () => qc.invalidateQueries({ queryKey: ['proposals'] }),
//     onError: (err) => toast.error(getErrorMessage(err)),
//   });
//   const rejectMutation = useMutation({
//     mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
//       apiFetch(`/api/proposals/${id}/reject`, { method: 'PATCH', body: reason ? { reason } : undefined }),
//     onSuccess: () => qc.invalidateQueries({ queryKey: ['proposals'] }),
//     onError: (err) => toast.error(getErrorMessage(err)),
//   });
//   return { proposals: data?.data ?? [], total: data?.total ?? 0, isLoading, error: error ? getErrorMessage(error) : null,
//     approve: approveMutation.mutate, reject: rejectMutation.mutate };
// }
// ─────────────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

export interface UseProposalsResult {
  proposals: Proposal[];
  total: number;
  isLoading: boolean;
  error: string | null;
  approve: (id: string) => Promise<void>;
  reject: (id: string, reason?: string) => Promise<void>;
}

export function useProposals(
  endpoint: 'mine' | 'all',
  status: ProposalStatus | 'all',
  page: number,
): UseProposalsResult {
  const { toast } = useToast();
  const [allProposals, setAllProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error] = useState<string | null>(null);
  const [loadTrigger, setLoadTrigger] = useState(0);

  useEffect(() => {
    setIsLoading(true);
    const t = setTimeout(() => {
      // Filter by endpoint (mine = author is the hardcoded user)
      let filtered = endpoint === 'mine'
        ? MOCK_PROPOSALS.filter((p) => p.author === 'alumno@uniovi.es' || p.author === 'uo123456@uniovi.es')
        : [...MOCK_PROPOSALS];

      if (status !== 'all') {
        filtered = filtered.filter((p) => p.status === status);
      }

      setAllProposals(filtered);
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(t);
  }, [endpoint, status, page, loadTrigger]);

  const total = allProposals.length;
  const start = (page - 1) * PAGE_SIZE;
  const proposals = allProposals.slice(start, start + PAGE_SIZE);

  const approve = useCallback(async (id: string) => {
    // Optimistic update
    setAllProposals((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: 'approved' } : p)),
    );
    try {
      await new Promise((res) => setTimeout(res, 600));
      // In real impl: PATCH /api/proposals/{id}/approve
    } catch (err) {
      // Roll back optimistic update on failure
      setAllProposals((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: 'pending' } : p)),
      );
      toast.error(getErrorMessage(err));
      throw err;
    }
  }, [toast]);

  const reject = useCallback(async (id: string, reason?: string) => {
    // Optimistic update
    setAllProposals((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, status: 'rejected', reject_reason: reason } : p,
      ),
    );
    try {
      await new Promise((res) => setTimeout(res, 600));
      // In real impl: PATCH /api/proposals/{id}/reject  body: { reason }
    } catch (err) {
      // Roll back optimistic update on failure
      setAllProposals((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: 'pending', reject_reason: undefined } : p)),
      );
      toast.error(getErrorMessage(err));
      throw err;
    }
  }, [toast]);

  void setLoadTrigger; // used only to allow future forced reload

  return { proposals, total, isLoading, error, approve, reject };
}

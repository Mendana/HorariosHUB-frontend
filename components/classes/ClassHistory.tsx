'use client';

import { useState, useEffect } from 'react';
import { useProposalHistory } from '@/lib/hooks/useProposalHistory';
import { ProposalList } from '@/components/proposals/ProposalList';
import { HistoryFilters } from '@/components/proposals/HistoryFilters';
import type { ProposalHistoryStatusFilter } from '@/lib/types/proposals';

const DEFAULT_PAGE_SIZE = 10;

// Read-only — GET /proposals/history never returns "pending" items, so there's
// nothing here to approve/reject.
async function noApprove() {}
async function noReject() {}

export function ClassHistory() {
  const [filter, setFilter] = useState<ProposalHistoryStatusFilter>('all');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(() =>
    typeof window !== 'undefined' ? Number(localStorage.getItem('historyPageSize')) || DEFAULT_PAGE_SIZE : DEFAULT_PAGE_SIZE,
  );

  const { proposals, total, isLoading, error, refetch } = useProposalHistory(filter, page, pageSize);

  useEffect(() => { setPage(1); }, [filter]);

  // Only the active filter has a real count; others stay 0 until selected
  const counts: Record<ProposalHistoryStatusFilter, number> = { all: 0, approved: 0, rejected: 0, [filter]: total };

  function handlePageSizeChange(size: number) {
    setPageSize(size);
    setPage(1);
    localStorage.setItem('historyPageSize', String(size));
  }

  return (
    <div>
      <HistoryFilters active={filter} counts={counts} onChange={setFilter} />
      <ProposalList
        proposals={proposals}
        total={total}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        error={error}
        emptyContext="filtered"
        showActions={false}
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
        onRetry={refetch}
        onApprove={noApprove}
        onReject={noReject}
      />
    </div>
  );
}

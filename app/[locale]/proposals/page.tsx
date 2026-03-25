'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import { useProposals } from '@/lib/hooks/useProposals';
import { ProposalList } from '@/components/proposals/ProposalList';
import { ProposalFilters } from '@/components/proposals/ProposalFilters';
import type { ProposalStatus } from '@/lib/types/proposals';
import { MOCK_PROPOSALS } from '@/lib/mock/proposals';

type Filter = ProposalStatus | 'all';

// Pre-compute counts for the filter tabs (professor/admin view)
function computeCounts(): Record<Filter, number> {
  const all = MOCK_PROPOSALS.length;
  const pending = MOCK_PROPOSALS.filter((p) => p.status === 'pending').length;
  const approved = MOCK_PROPOSALS.filter((p) => p.status === 'approved').length;
  const rejected = MOCK_PROPOSALS.filter((p) => p.status === 'rejected').length;
  return { all, pending, approved, rejected };
}

// ── Professor/Admin tab: pending review ──────────────────────────────────────

function ReviewTab() {
  const t = useTranslations('proposals');
  const [filter, setFilter] = useState<Filter>('pending');
  const [page, setPage] = useState(1);
  const [counts, setCounts] = useState(computeCounts());

  const { proposals, total, isLoading, error, approve, reject } = useProposals('all', filter, page);

  // Reset page when filter changes
  useEffect(() => { setPage(1); }, [filter]);

  const handleApprove = useCallback(
    async (id: string) => {
      await approve(id);
      setCounts((c) => ({ ...c, pending: Math.max(0, c.pending - 1), approved: c.approved + 1 }));
    },
    [approve],
  );

  const handleReject = useCallback(
    async (id: string, reason?: string) => {
      await reject(id, reason);
      setCounts((c) => ({ ...c, pending: Math.max(0, c.pending - 1), rejected: c.rejected + 1 }));
    },
    [reject],
  );

  return (
    <div>
      <ProposalFilters active={filter} counts={counts} onChange={(f) => setFilter(f)} />
      <ProposalList
        proposals={proposals}
        total={total}
        page={page}
        isLoading={isLoading}
        error={error}
        emptyContext={filter === 'pending' ? 'pending' : 'filtered'}
        showActions={true}
        onPageChange={setPage}
        onRetry={() => setPage((p) => p)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}

// ── My proposals tab (or sole view for regular users) ────────────────────────

function MyProposalsView() {
  const [page, setPage] = useState(1);
  const { proposals, total, isLoading, error, approve, reject } = useProposals('mine', 'all', page);

  return (
    <ProposalList
      proposals={proposals}
      total={total}
      page={page}
      isLoading={isLoading}
      error={error}
      emptyContext="mine"
      showActions={false}
      onPageChange={setPage}
      onRetry={() => setPage((p) => p)}
      onApprove={approve}
      onReject={reject}
    />
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function ProposalsPage() {
  const t = useTranslations('proposals');
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user === null) router.push('/auth/login');
  }, [user, router]);

  const [activeTab, setActiveTab] = useState<'review' | 'mine'>('review');

  if (user === null) return null;

  const isProfOrAdmin = user.role === 'professor' || user.role === 'admin';

  if (!isProfOrAdmin) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <h1 className="text-xl font-semibold text-primary mb-6">{t('titleMine')}</h1>
        <MyProposalsView />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
      <h1 className="text-xl font-semibold text-primary mb-4">{t('titleReview')}</h1>

      {/* Main tabs */}
      <div className="flex gap-0 border-b border-subtle mb-6">
        {(['review', 'mine'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-accent text-accent font-medium'
                : 'border-transparent text-secondary hover:text-primary'
            }`}
          >
            {tab === 'review' ? t('tabPending') : t('tabMine')}
          </button>
        ))}
      </div>

      {activeTab === 'review' ? <ReviewTab /> : <MyProposalsView />}
    </div>
  );
}

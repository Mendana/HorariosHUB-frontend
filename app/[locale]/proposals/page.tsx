'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import { useProposals } from '@/lib/hooks/useProposals';
import { ProposalList } from '@/components/proposals/ProposalList';
import { ProposalFilters } from '@/components/proposals/ProposalFilters';
import type { ProposalStatus } from '@/lib/types/proposals';
import { MOCK_PROPOSALS } from '@/lib/mock/proposals';

type Filter = ProposalStatus | 'all';

/** Pre-compute status counts from mock data (replaced by API data when live). */
function computeCounts(): Record<Filter, number> {
  const all      = MOCK_PROPOSALS.length;
  const pending  = MOCK_PROPOSALS.filter((p) => p.status === 'pending').length;
  const approved = MOCK_PROPOSALS.filter((p) => p.status === 'approved').length;
  const rejected = MOCK_PROPOSALS.filter((p) => p.status === 'rejected').length;
  return { all, pending, approved, rejected };
}

// ── Professor/Admin review tab ────────────────────────────────────────────────

function ReviewTab() {
  const t = useTranslations('proposals');
  const [filter, setFilter] = useState<Filter>('pending');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(() =>
    typeof window !== 'undefined' ? Number(localStorage.getItem('proposalsPageSize')) || 10 : 10,
  );
  const [counts, setCounts] = useState(computeCounts);

  const { proposals, total, isLoading, error, approve, reject } = useProposals('all', filter, page);

  // Reset to page 1 on filter change
  useEffect(() => { setPage(1); }, [filter]);

  function handlePageSizeChange(size: number) {
    setPageSize(size);
    setPage(1);
    localStorage.setItem('proposalsPageSize', String(size));
  }

  const handleApprove = useCallback(async (id: string) => {
    await approve(id);
    setCounts((c) => ({ ...c, pending: Math.max(0, c.pending - 1), approved: c.approved + 1 }));
  }, [approve]);

  const handleReject = useCallback(async (id: string, reason?: string) => {
    await reject(id, reason);
    setCounts((c) => ({ ...c, pending: Math.max(0, c.pending - 1), rejected: c.rejected + 1 }));
  }, [reject]);

  return (
    <div>
      <ProposalFilters active={filter} counts={counts} onChange={setFilter} />
      <ProposalList
        proposals={proposals}
        total={total}
        page={page}
        pageSize={pageSize}
        isLoading={isLoading}
        error={error}
        emptyContext={filter === 'pending' ? 'pending' : 'filtered'}
        showActions
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
        onRetry={() => setPage((p) => p)}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}

// ── My proposals (regular users or tab within prof/admin view) ────────────────

function MyProposalsView() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(() =>
    typeof window !== 'undefined' ? Number(localStorage.getItem('proposalsPageSize')) || 10 : 10,
  );
  const { proposals, total, isLoading, error, approve, reject } = useProposals('mine', 'all', page);

  function handlePageSizeChange(size: number) {
    setPageSize(size);
    setPage(1);
    localStorage.setItem('proposalsPageSize', String(size));
  }

  return (
    <ProposalList
      proposals={proposals}
      total={total}
      page={page}
      pageSize={pageSize}
      isLoading={isLoading}
      error={error}
      emptyContext="mine"
      showActions={false}
      onPageChange={setPage}
      onPageSizeChange={handlePageSizeChange}
      onRetry={() => setPage((p) => p)}
      onApprove={approve}
      onReject={reject}
    />
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProposalsPage() {
  const t = useTranslations('proposals');
  const { user } = useAuth();
  const router = useRouter();

  // Auth guard
  useEffect(() => {
    if (user === null) router.push('/auth/login');
  }, [user, router]);

  const [activeTab, setActiveTab] = useState<'review' | 'mine'>('review');

  if (user === null) return null;

  const isProfOrAdmin = user.role === 'profesor' || user.role === 'admin';
  const pendingCount = MOCK_PROPOSALS.filter((p) => p.status === 'pending').length;

  /* ── Regular user view (no tabs) ─────────────────────────────────────────── */
  if (!isProfOrAdmin) {
    return (
      <div className="max-w-5xl mx-auto px-4 md:px-6 pb-12">
        <div className="pt-6 pb-5 border-b border-subtle mb-6">
          <h1 className="text-xl font-semibold text-primary leading-tight">
            {t('titleMine')}
          </h1>
          <p className="mt-1 text-sm text-secondary leading-snug max-w-xl">
            {t('subtitleMine')}
          </p>
        </div>
        <MyProposalsView />
      </div>
    );
  }

  /* ── Professor / Admin view (with tabs) ──────────────────────────────────── */
  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 pb-12">
      {/* Page header */}
      <div className="pt-6 pb-5 border-b border-subtle mb-6">
        <h1 className="text-xl font-semibold text-primary leading-tight">
          {t('titleReview')}
        </h1>
        <p className="mt-1 text-sm text-secondary leading-snug max-w-xl">
          {t('subtitle')}
        </p>
      </div>

      {/* Tab switcher — segmented tray */}
      <div className="flex items-center bg-surface-raised border border-subtle rounded-md p-1 gap-0.5 w-fit mb-6">
        {(['review', 'mine'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={[
              'inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-sm',
              'transition-[background-color,color,box-shadow] duration-150',
              activeTab === tab
                ? 'bg-surface-base shadow-sm text-primary font-medium'
                : 'text-secondary hover:text-primary',
            ].join(' ')}
          >
            {tab === 'review' ? t('tabPending') : t('tabMine')}

            {/* Pending badge — only visible on the review tab */}
            {tab === 'review' && pendingCount > 0 && (
              <span
                className={[
                  'text-[10px] font-semibold px-1.5 py-0.5 rounded-full min-w-4.5 text-center',
                  'leading-none tabular-nums transition-colors duration-150',
                  activeTab === 'review'
                    ? 'bg-warning-subtle text-warning'
                    : 'bg-surface-sunken text-tertiary',
                ].join(' ')}
              >
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {activeTab === 'review' ? <ReviewTab /> : <MyProposalsView />}
    </div>
  );
}

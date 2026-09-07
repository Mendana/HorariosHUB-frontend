'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import { useProposals } from '@/lib/hooks/useProposals';
import { ProposalList } from '@/components/proposals/ProposalList';
import { ProposalFilters } from '@/components/proposals/ProposalFilters';
import type { ProposalStatus } from '@/lib/types/proposals';

type Filter = ProposalStatus | 'all';

// ── Professor/Admin review tab ────────────────────────────────────────────────

function ReviewTab() {
  const [filter, setFilter] = useState<Filter>('pending');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(() =>
    typeof window !== 'undefined' ? Number(localStorage.getItem('proposalsPageSize')) || 10 : 10,
  );

  const { proposals, total, isLoading, error, approve, reject } = useProposals('all', filter, page);

  useEffect(() => { setPage(1); }, [filter]);

  // Only the active filter has a real count; others stay 0 until selected
  const counts: Record<Filter, number> = { all: 0, pending: 0, approved: 0, rejected: 0, [filter]: total };

  function handlePageSizeChange(size: number) {
    setPageSize(size);
    setPage(1);
    localStorage.setItem('proposalsPageSize', String(size));
  }

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
        onApprove={approve}
        onReject={reject}
      />
    </div>
  );
}

// ── My proposals tab ──────────────────────────────────────────────────────────

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
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (user === null) router.push('/auth/login');
  }, [user, authLoading, router]);

  const [activeTab, setActiveTab] = useState<'review' | 'mine'>('review');

  if (authLoading || user === null) return null;

  const isProfOrAdmin = user.role === 'professor' || user.role === 'admin';

  if (!isProfOrAdmin) {
    return (
      <div className="max-w-5xl mx-auto px-4 md:px-6 pb-12">
        <div className="pt-6 pb-5 border-b border-subtle mb-6">
          <h1 className="text-xl font-semibold text-primary leading-tight">{t('titleMine')}</h1>
          <p className="mt-1 text-sm text-secondary leading-snug max-w-xl">{t('subtitleMine')}</p>
        </div>
        <MyProposalsView />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 pb-12">
      <div className="pt-6 pb-5 border-b border-subtle mb-6">
        <h1 className="text-xl font-semibold text-primary leading-tight">{t('titleReview')}</h1>
        <p className="mt-1 text-sm text-secondary leading-snug max-w-xl">{t('subtitle')}</p>
      </div>

      <div className="flex items-center bg-surface-raised border border-subtle rounded-md p-1 gap-0.5 w-fit mb-6">
        {(['review', 'mine'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={[
              'px-3 py-1.5 text-sm rounded-sm transition-[background-color,color,box-shadow] duration-150',
              activeTab === tab
                ? 'bg-surface-base shadow-sm text-primary font-medium'
                : 'text-secondary hover:text-primary',
            ].join(' ')}
          >
            {tab === 'review' ? t('tabPending') : t('tabMine')}
          </button>
        ))}
      </div>

      {activeTab === 'review' ? <ReviewTab /> : <MyProposalsView />}
    </div>
  );
}

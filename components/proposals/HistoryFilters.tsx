'use client';

import { useTranslations } from 'next-intl';
import type { ProposalHistoryStatusFilter } from '@/lib/types/proposals';

interface HistoryFiltersProps {
  active: ProposalHistoryStatusFilter;
  counts: Record<ProposalHistoryStatusFilter, number>;
  onChange: (filter: ProposalHistoryStatusFilter) => void;
}

const FILTERS: ProposalHistoryStatusFilter[] = ['all', 'approved', 'rejected'];

const LABEL_KEYS: Record<ProposalHistoryStatusFilter, string> = {
  all: 'filterAll',
  approved: 'filterApproved',
  rejected: 'filterRejected',
};

const ACTIVE_CLS: Record<ProposalHistoryStatusFilter, string> = {
  all: 'bg-accent-subtle text-accent border-accent/30',
  approved: 'bg-success-subtle text-success border-success/30',
  rejected: 'bg-error-subtle text-error border-error/30',
};

// Same filter-pill pattern as ProposalFilters, but scoped to the statuses
// GET /proposals/history actually accepts (no "pending" — a proposal only
// has history once it's been resolved).
export function HistoryFilters({ active, counts, onChange }: HistoryFiltersProps) {
  const t = useTranslations('proposals');

  return (
    <div className="flex flex-wrap items-center gap-1.5 mb-5">
      {FILTERS.map((filter) => {
        const isActive = filter === active;
        return (
          <button
            key={filter}
            type="button"
            onClick={() => onChange(filter)}
            className={[
              'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-sm border',
              'transition-[background-color,color,border-color] duration-150',
              isActive
                ? ACTIVE_CLS[filter]
                : 'bg-transparent border-subtle text-secondary hover:text-primary hover:border-strong/60',
            ].join(' ')}
          >
            {t(LABEL_KEYS[filter])}
            <span className={['tabular-nums text-[11px]', isActive ? 'opacity-80' : 'opacity-50'].join(' ')}>
              {counts[filter]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

'use client';

import { useTranslations } from 'next-intl';
import type { ProposalStatus } from '@/lib/types/proposals';

type Filter = ProposalStatus | 'all';

interface ProposalFiltersProps {
  active: Filter;
  counts: Record<Filter, number>;
  onChange: (filter: Filter) => void;
}

const FILTERS: Filter[] = ['pending', 'approved', 'rejected', 'all'];

const LABEL_KEYS: Record<Filter, string> = {
  pending:  'filterPending',
  approved: 'filterApproved',
  rejected: 'filterRejected',
  all:      'filterAll',
};

const ACTIVE_CLS: Record<Filter, string> = {
  pending:  'bg-warning-subtle text-warning border-warning/30',
  approved: 'bg-success-subtle text-success border-success/30',
  rejected: 'bg-error-subtle text-error border-error/30',
  all:      'bg-accent-subtle text-accent border-accent/30',
};

export function ProposalFilters({ active, counts, onChange }: ProposalFiltersProps) {
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

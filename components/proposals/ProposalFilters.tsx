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
  pending: 'filterPending',
  approved: 'filterApproved',
  rejected: 'filterRejected',
  all: 'filterAll',
};

export function ProposalFilters({ active, counts, onChange }: ProposalFiltersProps) {
  const t = useTranslations('proposals');

  return (
    <div className="flex flex-wrap gap-1.5 mb-4">
      {FILTERS.map((filter) => {
        const isActive = filter === active;
        return (
          <button
            key={filter}
            onClick={() => onChange(filter)}
            className={`px-3 py-1 text-sm rounded-sm border transition-colors ${
              isActive
                ? 'bg-accent-subtle border-accent text-accent'
                : 'bg-transparent border-subtle text-secondary hover:text-primary hover:border-strong'
            }`}
          >
            {t(LABEL_KEYS[filter])}
            <span className="ml-1.5 text-xs opacity-70">({counts[filter]})</span>
          </button>
        );
      })}
    </div>
  );
}

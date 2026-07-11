'use client';

import { useTranslations } from 'next-intl';
import { Search, X } from 'lucide-react';
import { INPUT_FIELD_CLS } from '@/components/ui/Input';

interface ClassFiltersProps {
  search: string;
  week: string;
  hasActiveFilters: boolean;
  onSearchChange: (v: string) => void;
  onWeekChange: (v: string) => void;
  onClear: () => void;
}

const inputCls = `${INPUT_FIELD_CLS} h-8 px-3 text-sm`;

export function ClassFilters({
  search, week, hasActiveFilters,
  onSearchChange, onWeekChange, onClear,
}: ClassFiltersProps) {
  const t = useTranslations('classes');

  return (
    <div className="flex flex-wrap items-center gap-2 mb-3">
      {/* Search */}
      <div className="relative">
        <Search
          size={14}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-tertiary pointer-events-none"
          aria-hidden
        />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('filterSearchPlaceholder')}
          className={`${inputCls} pl-8 w-52`}
        />
      </div>

      {/* Week */}
      <input
        type="week"
        value={week}
        onChange={(e) => onWeekChange(e.target.value)}
        aria-label={t('filterWeekLabel')}
        className={`${inputCls} w-44`}
      />

      {/* Clear */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1.5 h-8 px-3 text-xs text-secondary border border-subtle rounded-sm hover:text-primary hover:border-strong transition-colors"
        >
          <X size={13} aria-hidden />
          {t('filterClear')}
        </button>
      )}
    </div>
  );
}

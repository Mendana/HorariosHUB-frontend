'use client';

import { useTranslations } from 'next-intl';
import { Search, X } from 'lucide-react';
import { INPUT_FIELD_CLS } from '@/components/ui/Input';
import { formatIsoWeekParam, isoWeekParamToMonday, getISOWeekFromDate } from '@/lib/utils/scheduleHelpers';

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

  // Native <input type="week"> isn't supported by Safari (iOS/macOS) — it falls
  // back to free text, forcing users to type "2024-W12" by hand. A plain date
  // input works everywhere; we just convert the picked day to/from the ISO
  // week string the API expects (any day within the target week works).
  const weekMonday = week ? isoWeekParamToMonday(week) : null;
  const dateInputValue = weekMonday
    ? [
        weekMonday.getUTCFullYear(),
        String(weekMonday.getUTCMonth() + 1).padStart(2, '0'),
        String(weekMonday.getUTCDate()).padStart(2, '0'),
      ].join('-')
    : '';

  function handleDateChange(value: string) {
    if (!value) { onWeekChange(''); return; }
    const [y, m, d] = value.split('-').map(Number);
    const { year, week: isoWeek } = getISOWeekFromDate(new Date(Date.UTC(y, m - 1, d)));
    onWeekChange(formatIsoWeekParam(year, isoWeek));
  }

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

      {/* Week — picked via any date within it (type="week" isn't supported in Safari) */}
      <input
        type="date"
        value={dateInputValue}
        onChange={(e) => handleDateChange(e.target.value)}
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

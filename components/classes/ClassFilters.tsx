'use client';

import { useTranslations } from 'next-intl';
import { Search, X } from 'lucide-react';
import type { ClassType } from '@/lib/types/classes';
import { INPUT_FIELD_CLS } from '@/components/ui/Input';

const CLASS_TYPES: ClassType[] = ['Teoría', 'Práctica', 'Examen', 'Otros'];

interface ClassFiltersProps {
  search: string;
  type: string;
  week: string;
  hasActiveFilters: boolean;
  onSearchChange: (v: string) => void;
  onTypeChange: (v: string) => void;
  onWeekChange: (v: string) => void;
  onClear: () => void;
}

const inputClass = `${INPUT_FIELD_CLS} h-9 px-3 text-sm`;

export function ClassFilters({
  search, type, week, hasActiveFilters,
  onSearchChange, onTypeChange, onWeekChange, onClear,
}: ClassFiltersProps) {
  const t = useTranslations('classes');

  const TYPE_LABELS: Record<ClassType, string> = {
    'Teoría':   t('typeTeoria'),
    'Práctica': t('typePractica'),
    'Examen':   t('typeExamen'),
    'Otros':    t('typeOtros'),
  };

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
          className={`${inputClass} pl-8 w-52`}
        />
      </div>

      {/* Type */}
      <select
        value={type}
        onChange={(e) => onTypeChange(e.target.value)}
        className={`${inputClass} w-40`}
      >
        <option value="">{t('filterTypeAll')}</option>
        {CLASS_TYPES.map((ct) => (
          <option key={ct} value={ct}>{TYPE_LABELS[ct]}</option>
        ))}
      </select>

      {/* Week */}
      <input
        type="week"
        value={week}
        onChange={(e) => onWeekChange(e.target.value)}
        aria-label={t('filterWeekLabel')}
        className={`${inputClass} w-44`}
      />

      {/* Clear */}
      {hasActiveFilters && (
        <button
          onClick={onClear}
          className="inline-flex items-center gap-1.5 h-9 px-3 text-sm text-secondary border border-subtle rounded-sm hover:text-primary hover:border-strong transition-colors"
        >
          <X size={14} aria-hidden />
          {t('filterClear')}
        </button>
      )}
    </div>
  );
}

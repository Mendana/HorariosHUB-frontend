'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { Search, X } from 'lucide-react';
import { INPUT_FIELD_CLS } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { fetchAllSubjects } from '@/lib/api/subjects';

interface EventFiltersProps {
  search: string;
  subject: string;
  hasActiveFilters: boolean;
  onSearchChange: (v: string) => void;
  onSubjectChange: (v: string) => void;
  onClear: () => void;
}

const inputCls = `${INPUT_FIELD_CLS} h-8 px-3 text-sm`;

export function EventFilters({
  search, subject, hasActiveFilters,
  onSearchChange, onSubjectChange, onClear,
}: EventFiltersProps) {
  const t = useTranslations('events');

  const { data: subjectsData } = useQuery({
    queryKey: ['subjects-list'],
    queryFn: fetchAllSubjects,
    staleTime: 10 * 60 * 1000,
  });

  const subjectOptions = useMemo(
    () => [
      { value: '', label: t('filterSubjectAll') },
      ...(subjectsData?.subjects ?? []).map((code) => ({ value: code, label: code })),
    ],
    [subjectsData, t],
  );

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
          placeholder={t('searchPlaceholder')}
          className={`${inputCls} pl-8 w-52`}
        />
      </div>

      {/* Subject */}
      <Select
        value={subject}
        onChange={onSubjectChange}
        options={subjectOptions}
        searchable
        size="sm"
        ariaLabel={t('filterSubjectAll')}
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

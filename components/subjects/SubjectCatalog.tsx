'use client';

import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { CatalogSubject } from '@/lib/types/subjects';
import { SubjectItem } from './SubjectItem';

const SKELETON_COUNT = 5;

interface SubjectCatalogProps {
  subjects: CatalogSubject[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  localSelection: Set<string>;
  onToggle: (groupId: string) => void;
}

export function SubjectCatalog({
  subjects,
  isLoading,
  error,
  onRetry,
  localSelection,
  onToggle,
}: SubjectCatalogProps) {
  const t = useTranslations('mySubjects');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return subjects;
    return subjects.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q),
    );
  }, [subjects, query]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 mt-2">
        {Array.from({ length: SKELETON_COUNT }, (_, i) => (
          <div
            key={i}
            className="h-12 rounded-sm bg-surface-raised animate-pulse"
            style={{ width: `${85 + (i % 3) * 5}%` }}
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 flex items-center justify-between gap-4 px-4 py-3 rounded-sm bg-error-subtle border border-error">
        <p className="text-sm text-error">{t('loadError')}</p>
        <button
          onClick={onRetry}
          className="shrink-0 text-sm font-medium text-error hover:underline"
        >
          {t('retry')}
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Search */}
      <div className="relative mb-4">
        <Search
          size={14}
          aria-hidden
          className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary pointer-events-none"
        />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="h-9 w-full sm:w-64 pl-8 pr-3 rounded-sm bg-surface-sunken border border-subtle text-sm text-primary placeholder:text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        />
      </div>

      {/* Subject list */}
      <div className="flex flex-col divide-y divide-subtle">
        {filtered.length === 0 ? (
          <p className="py-10 text-center text-sm text-secondary">{t('noResults')}</p>
        ) : (
          filtered.map((subject) => (
            <SubjectItem
              key={subject.code}
              subject={subject}
              localSelection={localSelection}
              onToggle={onToggle}
            />
          ))
        )}
      </div>
    </div>
  );
}

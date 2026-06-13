'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Search, LayoutList, LayoutGrid, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { INPUT_FIELD_CLS } from '@/components/ui/Input';
import type { CatalogSubject } from '@/lib/types/subjects';
import { SubjectItem } from './SubjectItem';
import { SubjectCard } from './SubjectCard';

// ─── Types ─────────────────────────────────────────────────────────────────────

export type ViewMode = 'list' | 'grid';
type Filter = 'all' | 'selected' | 'unselected' | 'partial';
type Sort = 'name-asc' | 'name-desc' | 'code' | 'groups-desc';

const SKELETON_COUNT = 7;

// ─── Props ─────────────────────────────────────────────────────────────────────

interface SubjectCatalogProps {
  subjects: CatalogSubject[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  localSelection: Set<string>;
  onToggle: (groupId: string) => void;
}

// ─── Component ─────────────────────────────────────────────────────────────────

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
  const [view, setView] = useState<ViewMode>('list');
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<Sort>('name-asc');
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  // Close sort dropdown on outside click
  useEffect(() => {
    if (!sortOpen) return;
    function handler(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [sortOpen]);

  // ── Derived filter/sort ─────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = subjects;

    // Text search
    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter((s) => s.code.toLowerCase().includes(q));
    }

    // Status filter
    if (filter !== 'all') {
      result = result.filter((s) => {
        const sel = s.groups.filter((g) => localSelection.has(g.id)).length;
        if (filter === 'selected') return sel === s.groups.length && s.groups.length > 0;
        if (filter === 'unselected') return sel === 0;
        if (filter === 'partial') return sel > 0 && sel < s.groups.length;
        return true;
      });
    }

    // Sort
    return [...result].sort((a, b) => {
      if (sort === 'name-asc') return a.code.localeCompare(b.code, 'es');
      if (sort === 'name-desc') return b.code.localeCompare(a.code, 'es');
      if (sort === 'code') return a.code.localeCompare(b.code);
      if (sort === 'groups-desc') return b.groups.length - a.groups.length;
      return 0;
    });
  }, [subjects, query, filter, sort, localSelection]);

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col gap-px mt-2">
        {Array.from({ length: SKELETON_COUNT }, (_, i) => (
          <div
            key={i}
            className="h-[52px] rounded-sm bg-surface-raised animate-pulse border-l-[3px] border-strong/20"
            style={{ animationDelay: `${i * 55}ms`, width: `${88 + (i % 4) * 3}%` }}
          />
        ))}
      </div>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────────
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

  // ── Toolbar data ─────────────────────────────────────────────────────────────
  const FILTER_OPTIONS: { key: Filter; label: string }[] = [
    { key: 'all', label: t('filterAll') },
    { key: 'selected', label: t('filterSelected') },
    { key: 'unselected', label: t('filterUnselected') },
    { key: 'partial', label: t('filterPartial') },
  ];

  const SORT_OPTIONS: { key: Sort; label: string }[] = [
    { key: 'name-asc', label: t('sortNameAsc') },
    { key: 'name-desc', label: t('sortNameDesc') },
    { key: 'code', label: t('sortCodeAsc') },
    { key: 'groups-desc', label: t('sortGroupsDesc') },
  ];

  const currentSortLabel = SORT_OPTIONS.find((o) => o.key === sort)?.label ?? '';
  const showingLabel = filtered.length === 1 ? t('showing', { count: filtered.length }) : t('showingPlural', { count: filtered.length });

  return (
    <div>
      {/* ── Toolbar ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 mb-3">

        {/* Search */}
        <div className="relative flex-1 min-w-[160px] max-w-[280px]">
          <Search
            size={13}
            aria-hidden
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-tertiary pointer-events-none"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className={`${INPUT_FIELD_CLS} h-8 w-full pl-8 pr-3 text-sm`}
          />
        </div>

        {/* Filter pill tray */}
        <div className="flex items-center gap-px p-0.5 bg-surface-raised rounded-sm border border-subtle">
          {FILTER_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={[
                'px-2.5 h-7 text-xs rounded-[3px] transition-[background-color,color,box-shadow] transition-fast whitespace-nowrap',
                filter === key
                  ? 'bg-surface-base text-primary font-medium shadow-sm'
                  : 'text-secondary hover:text-primary',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Sort dropdown */}
        <div ref={sortRef} className="relative hidden sm:block">
          <button
            onClick={() => setSortOpen((o) => !o)}
            className="h-8 px-2.5 flex items-center gap-1.5 text-xs text-secondary hover:text-primary bg-surface-raised border border-subtle rounded-sm transition-[color] transition-fast"
          >
            <SlidersHorizontal size={12} aria-hidden className="text-tertiary" />
            <span className="text-xs">{currentSortLabel}</span>
            <ChevronDown
              size={11}
              aria-hidden
              className={`text-tertiary transition-transform transition-fast ${sortOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {sortOpen && (
            <div className="animate-dropdown absolute top-full mt-1 right-0 bg-surface-raised border border-subtle rounded-sm shadow-md z-20 min-w-[140px] overflow-hidden py-0.5">
              {SORT_OPTIONS.map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => { setSort(key); setSortOpen(false); }}
                  className={[
                    'w-full text-left px-3 py-1.5 text-xs transition-[background-color,color] transition-fast',
                    sort === key
                      ? 'text-primary font-medium bg-accent-subtle'
                      : 'text-secondary hover:text-primary hover:bg-surface-sunken',
                  ].join(' ')}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* View toggle */}
        <div className="flex items-center gap-px p-0.5 bg-surface-raised rounded-sm border border-subtle">
          <button
            onClick={() => setView('list')}
            aria-label={t('viewList')}
            className={[
              'p-1.5 rounded-[3px] transition-[background-color,color] transition-fast',
              view === 'list'
                ? 'bg-surface-base text-primary shadow-sm'
                : 'text-tertiary hover:text-secondary',
            ].join(' ')}
          >
            <LayoutList size={13} aria-hidden />
          </button>
          <button
            onClick={() => setView('grid')}
            aria-label={t('viewGrid')}
            className={[
              'p-1.5 rounded-[3px] transition-[background-color,color] transition-fast',
              view === 'grid'
                ? 'bg-surface-base text-primary shadow-sm'
                : 'text-tertiary hover:text-secondary',
            ].join(' ')}
          >
            <LayoutGrid size={13} aria-hidden />
          </button>
        </div>
      </div>

      {/* ── Result count ─────────────────────────────────────────────────────── */}
      <p className="text-[11px] text-tertiary tracking-label mb-3">
        {showingLabel}
      </p>

      {/* ── Empty state ──────────────────────────────────────────────────────── */}
      {filtered.length === 0 && (
        <p className="py-12 text-center text-sm text-secondary">{t('noResults')}</p>
      )}

      {/* ── List view ────────────────────────────────────────────────────────── */}
      {view === 'list' && filtered.length > 0 && (
        <div className="flex flex-col">
          {filtered.map((subject, i) => (
            <SubjectItem
              key={subject.code}
              subject={subject}
              localSelection={localSelection}
              onToggle={onToggle}
              index={i}
            />
          ))}
        </div>
      )}

      {/* ── Grid view ────────────────────────────────────────────────────────── */}
      {view === 'grid' && filtered.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map((subject, i) => (
            <SubjectCard
              key={subject.code}
              subject={subject}
              localSelection={localSelection}
              onToggle={onToggle}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { useTranslations } from 'next-intl';
import { SearchResultItem } from './SearchResultItem';
import type { SearchResult } from '@/lib/hooks/useSearch';
import { getISOWeekFromDate, getWeekDates } from '@/lib/utils/scheduleHelpers';

// ─── Week-group label helpers ─────────────────────────────────────────────────

const GROUP_THIS = 'THIS_WEEK';
const GROUP_NEXT = 'NEXT_WEEK';

function weekGroupKey(isoYear: number, isoWeek: number): string {
  const { year: cy, week: cw } = getISOWeekFromDate(new Date());
  if (isoYear === cy && isoWeek === cw)     return GROUP_THIS;
  if (isoYear === cy && isoWeek === cw + 1) return GROUP_NEXT;
  return `WEEK_${isoYear}_${isoWeek}`;
}

function weekGroupDate(key: string): string {
  const parts = key.split('_'); // WEEK_{year}_{week}
  const yr = parseInt(parts[1]);
  const wk = parseInt(parts[2]);
  const monday = getWeekDates(yr, wk)[0];
  const day   = monday.getUTCDate();
  const month = new Intl.DateTimeFormat('es', { month: 'short', timeZone: 'UTC' }).format(monday);
  return `${day} ${month}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface SearchResultsProps {
  query: string;
  results: SearchResult[];
  onSelect: (r: SearchResult) => void;
  highlightedIdx?: number;
}

export function SearchResults({ query, results, onSelect, highlightedIdx = -1 }: SearchResultsProps) {
  const t = useTranslations('search');

  const baseDropdownCls =
    'animate-dropdown absolute right-0 top-full mt-1.5 w-screen sm:w-auto sm:min-w-[320px] max-w-[calc(100vw-1rem)] bg-surface-raised border border-subtle rounded-md shadow-md z-50 overflow-hidden';

  if (results.length === 0) {
    return (
      <div className={baseDropdownCls}>
        <p className="px-3 py-3 text-[12px] text-secondary">
          {t('noResults', { query })}
        </p>
      </div>
    );
  }

  // Group by ISO week, max 3 groups
  const groups = new Map<string, SearchResult[]>();
  for (const r of results) {
    const key = weekGroupKey(r.isoYear, r.isoWeek);
    if (!groups.has(key)) {
      if (groups.size >= 3) break;
      groups.set(key, []);
    }
    groups.get(key)!.push(r);
  }

  function groupHeader(key: string): string {
    if (key === GROUP_THIS) return t('groupThisWeek');
    if (key === GROUP_NEXT) return t('groupNextWeek');
    return t('groupWeekOf', { date: weekGroupDate(key) });
  }

  // Flatten all results across groups to compute global index for highlighting
  const flatResults: SearchResult[] = [];
  for (const items of groups.values()) {
    for (const r of items) flatResults.push(r);
  }

  let globalIdx = 0;
  return (
    <div className={baseDropdownCls} role="listbox" aria-label={t('placeholder')}>
      {Array.from(groups.entries()).map(([key, items], gi) => (
        <div key={key}>
          {gi > 0 && <div className="border-t border-subtle" />}
          <div className="px-3 pt-2 pb-1" role="presentation">
            <span className="text-[10px] font-medium text-tertiary tracking-label">
              {groupHeader(key)}
            </span>
          </div>
          {items.map((r) => {
            const idx = globalIdx++;
            return (
              <SearchResultItem
                key={r.subject.id}
                result={r}
                onSelect={onSelect}
                highlighted={idx === highlightedIdx}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}

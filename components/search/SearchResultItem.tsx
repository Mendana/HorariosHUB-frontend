'use client';

import { MapPin } from 'lucide-react';
import { getSubjectColorVars } from '@/lib/config/subjectColors';
import type { SearchResult } from '@/lib/hooks/useSearch';

// ─── Date helpers ─────────────────────────────────────────────────────────────

const DOW_SHORT = ['', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie'];

function dowFromDate(d: { year: number; month: number; day: number }): number {
  const v = new Date(d.year, d.month - 1, d.day).getDay();
  return v === 0 ? 7 : v; // Mon=1 … Sun=7
}

function formatResultDate(d: { year: number; month: number; day: number }): string {
  const utc = new Date(Date.UTC(d.year, d.month - 1, d.day));
  const day = utc.getUTCDate();
  const month = new Intl.DateTimeFormat('es', { month: 'short', timeZone: 'UTC' }).format(utc);
  const dow = dowFromDate(d);
  return `${DOW_SHORT[dow]} ${day} ${month}`;
}


// ─── Component ────────────────────────────────────────────────────────────────

interface SearchResultItemProps {
  result: SearchResult;
  onSelect: (r: SearchResult) => void;
  highlighted?: boolean;
}

export function SearchResultItem({ result, onSelect, highlighted = false }: SearchResultItemProps) {
  const { subject } = result;
  const colorVars = getSubjectColorVars(subject.name);
  const dotColor = colorVars['--sb-border'];

  return (
    <button
      type="button"
      role="option"
      aria-selected={highlighted}
      id={`search-result-${result.subject.id}`}
      onClick={() => onSelect(result)}
      // Border-left indicator: transparent → accent/40 on hover → accent solid on keyboard select.
      // pl-[10px] + border-l-2 = 12px total left gap, matching the visual rhythm of px-3.
      className={[
        'w-full flex items-start gap-2.5 pl-[10px] pr-3 py-2 text-left',
        'border-l-2 transition-[background-color,border-color] transition-fast',
        highlighted
          ? 'bg-accent-subtle border-accent'
          : 'border-transparent hover:bg-accent-subtle hover:border-accent/40',
      ].join(' ')}
    >
      {/* Color dot — slightly larger for more visual presence */}
      <span
        aria-hidden
        className="mt-1 size-2.5 rounded-full shrink-0"
        style={{ backgroundColor: dotColor }}
      />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[13px] font-medium text-primary leading-tight">
            {subject.name}
          </span>
        </div>

        {/* Day · time */}
        <p className="text-[12px] text-secondary mt-0.5 tabular-nums">
          {formatResultDate(subject.date)} · {subject.startTime}–{subject.endTime}
        </p>

        {/* Classroom */}
        {subject.classroom && (
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin size={10} className="text-tertiary shrink-0" aria-hidden />
            <span className="text-[12px] text-tertiary">{subject.classroom}</span>
          </div>
        )}
      </div>
    </button>
  );
}

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
}

export function SearchResultItem({ result, onSelect }: SearchResultItemProps) {
  const { subject } = result;
  const colorVars = getSubjectColorVars(subject.name);
  const dotColor = colorVars['--sb-border'];

  return (
    <button
      type="button"
      onClick={() => onSelect(result)}
      className="w-full flex items-start gap-2.5 px-3 py-2 text-left hover:bg-accent-subtle transition-[background-color] transition-fast"
    >
      {/* Color dot */}
      <span
        aria-hidden
        className="mt-[3px] size-2 rounded-full shrink-0"
        style={{ backgroundColor: dotColor }}
      />

      <div className="flex-1 min-w-0">
        {/* Name + type badge */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[13px] font-medium text-primary leading-tight">
            {subject.name}
          </span>
          {subject.type && subject.type !== 'Teoría' && (
            <span className="text-[10px] font-medium text-secondary bg-surface-sunken px-1.5 py-0.5 rounded-sm leading-none">
              {subject.type}
            </span>
          )}
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

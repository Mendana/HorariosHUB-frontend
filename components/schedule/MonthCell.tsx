'use client';

import { useTranslations } from 'next-intl';
import type { Subject } from '@/lib/types/schedule';
import { getSubjectColorVars } from '@/lib/config/subjectColors';

interface MonthCellProps {
  date: Date;
  subjects: Subject[];
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  onClick: () => void;
}

export function MonthCell({
  date,
  subjects,
  isCurrentMonth,
  isToday,
  isSelected,
  onClick,
}: MonthCellProps) {
  const t = useTranslations('schedule');
  const dayNumber = date.getUTCDate();

  // Deduplicate by name (multiple classes of same subject → single entry)
  const uniqueNames = Array.from(new Set(subjects.map((s) => s.name)));

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className={[
        'relative flex flex-col p-1 cursor-pointer select-none',
        'border-b border-r border-subtle',
        // Minimum height: compact on mobile, taller on tablet/desktop
        'min-h-14 sm:min-h-20 lg:min-h-24',
        'transition-colors transition-base',
        isCurrentMonth
          ? isSelected
            ? 'bg-accent-subtle'
            : 'bg-surface-base hover:bg-surface-raised'
          : 'bg-surface-sunken hover:brightness-[1.03]',
      ].join(' ')}
    >
      {/* Day number — top-right corner */}
      <div className="flex justify-end mb-0.5">
        <span
          className={[
            'text-xs tabular-nums w-5 h-5 flex items-center justify-center rounded-full leading-none font-medium',
            isToday
              ? 'bg-accent text-white'
              : isCurrentMonth
              ? 'text-primary'
              : 'text-tertiary',
          ].join(' ')}
        >
          {dayNumber}
        </span>
      </div>

      {/* Mobile: colored dots only */}
      <div className="flex flex-wrap gap-0.5 justify-start sm:hidden mt-0.5">
        {subjects.slice(0, 5).map((s) => {
          const vars = getSubjectColorVars(s.name);
          return (
            <span
              key={s.id}
              className="size-1.5 rounded-full shrink-0"
              style={{ backgroundColor: vars['--sb-border'] }}
            />
          );
        })}
        {subjects.length > 5 && (
          <span className="size-1.5 rounded-full bg-border-strong shrink-0" />
        )}
      </div>

      {/* Tablet (sm–lg): up to 2 events with text */}
      <div className="hidden sm:flex lg:hidden flex-col gap-0.5 overflow-hidden">
        {uniqueNames.slice(0, 2).map((name) => {
          const vars = getSubjectColorVars(name);
          const shortName = name.split(' - ')[0].trim();
          return (
            <div key={name} className="flex items-center gap-1 min-w-0">
              <span
                className="size-1.5 rounded-full shrink-0"
                style={{ backgroundColor: vars['--sb-border'] }}
              />
              <span className="text-[11px] text-primary truncate leading-tight">{shortName}</span>
            </div>
          );
        })}
        {uniqueNames.length > 2 && (
          <span className="text-[11px] text-secondary leading-tight">
            {t('moreEvents', { count: uniqueNames.length - 2 })}
          </span>
        )}
      </div>

      {/* Desktop (lg+): up to 3 events with text */}
      <div className="hidden lg:flex flex-col gap-0.5 overflow-hidden">
        {uniqueNames.slice(0, 3).map((name) => {
          const vars = getSubjectColorVars(name);
          const shortName = name.split(' - ')[0].trim();
          return (
            <div key={name} className="flex items-center gap-1 min-w-0">
              <span
                className="size-1.5 rounded-full shrink-0"
                style={{ backgroundColor: vars['--sb-border'] }}
              />
              <span className="text-[11px] text-primary truncate leading-tight">{shortName}</span>
            </div>
          );
        })}
        {uniqueNames.length > 3 && (
          <span className="text-[11px] text-secondary leading-tight">
            {t('moreEvents', { count: uniqueNames.length - 3 })}
          </span>
        )}
      </div>
    </div>
  );
}

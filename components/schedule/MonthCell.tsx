'use client';

import { useTranslations } from 'next-intl';
import { Flag } from 'lucide-react';
import type { Subject } from '@/lib/types/schedule';
import type { UserEvent, EventType } from '@/lib/types/events';
import { getSubjectColorVars } from '@/lib/config/subjectColors';

// ─── Event type colors (inline, matches EVENT_TYPE_COLOR in EventLine) ────────
const EVENT_CSS_COLOR: Record<EventType, string> = {
  delivery: 'var(--warning)',
  deadline: 'var(--error)',
  reminder: 'var(--accent)',
  other:    'var(--text-secondary)',
};

interface MonthCellProps {
  date: Date;
  subjects: Subject[];
  events: UserEvent[];
  eventsVisible: boolean;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  onClick: () => void;
}

export function MonthCell({
  date,
  subjects,
  events,
  eventsVisible,
  isCurrentMonth,
  isToday,
  isSelected,
  onClick,
}: MonthCellProps) {
  const t = useTranslations('schedule');
  const dayNumber = date.getUTCDate();

  // Deduplicate by name (multiple classes of same subject → single entry)
  const uniqueNames = Array.from(new Set(subjects.map((s) => s.name)));

  // Events to show (only when visible)
  const visibleEvents = eventsVisible ? events : [];

  // Available slots per breakpoint (subjects take priority)
  const SLOTS_SM = 2;  // tablet: up to 2 subject rows
  const SLOTS_LG = 3;  // desktop: up to 3 subject rows

  const subjectsSm = uniqueNames.slice(0, SLOTS_SM);
  const eventSlotsSm = Math.max(0, SLOTS_SM - subjectsSm.length);
  const eventsSm = visibleEvents.slice(0, eventSlotsSm);
  const extraSm = Math.max(0, (uniqueNames.length - SLOTS_SM) + (visibleEvents.length - eventSlotsSm));

  const subjectsLg = uniqueNames.slice(0, SLOTS_LG);
  const eventSlotsLg = Math.max(0, SLOTS_LG - subjectsLg.length);
  const eventsLg = visibleEvents.slice(0, eventSlotsLg);
  const extraLg = Math.max(0, (uniqueNames.length - SLOTS_LG) + (visibleEvents.length - eventSlotsLg));

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

      {/* Mobile: colored dots for subjects + flag icons for events */}
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
        {visibleEvents.slice(0, 3).map((ev) => (
          <Flag
            key={ev.id}
            size={8}
            className="shrink-0"
            style={{ color: ev.color ?? EVENT_CSS_COLOR[ev.type] }}
            aria-hidden
          />
        ))}
        {(subjects.length > 5 || visibleEvents.length > 3) && (
          <span className="size-1.5 rounded-full bg-border-strong shrink-0" />
        )}
      </div>

      {/* Tablet (sm–lg): up to 2 rows — subjects first, then events */}
      <div className="hidden sm:flex lg:hidden flex-col gap-0.5 overflow-hidden">
        {subjectsSm.map((name) => {
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
        {eventsSm.map((ev) => (
          <div key={ev.id} className="flex items-center gap-1 min-w-0">
            <Flag
              size={10}
              className="shrink-0"
              style={{ color: ev.color ?? EVENT_CSS_COLOR[ev.type] }}
              aria-hidden
            />
            <span
              className="text-[11px] truncate leading-tight"
              style={{ color: ev.color ?? EVENT_CSS_COLOR[ev.type] }}
            >
              {ev.title}
            </span>
          </div>
        ))}
        {extraSm > 0 && (
          <span className="text-[11px] text-tertiary leading-tight">
            {t('moreEvents', { count: extraSm })}
          </span>
        )}
      </div>

      {/* Desktop (lg+): up to 3 rows — subjects first, then events */}
      <div className="hidden lg:flex flex-col gap-0.5 overflow-hidden">
        {subjectsLg.map((name) => {
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
        {eventsLg.map((ev) => (
          <div key={ev.id} className="flex items-center gap-1 min-w-0">
            <Flag
              size={10}
              className="shrink-0"
              style={{ color: ev.color ?? EVENT_CSS_COLOR[ev.type] }}
              aria-hidden
            />
            <span
              className="text-[11px] truncate leading-tight"
              style={{ color: ev.color ?? EVENT_CSS_COLOR[ev.type] }}
            >
              {ev.title}
            </span>
          </div>
        ))}
        {extraLg > 0 && (
          <span className="text-[11px] text-tertiary leading-tight">
            {t('moreEvents', { count: extraLg })}
          </span>
        )}
      </div>
    </div>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayColumn } from './DayColumn';
import { TimeLabelsColumn } from './TimeLabelsColumn';
import { ScheduleEmpty } from './ScheduleEmpty';
import type { ScheduleEmptyVariant } from './ScheduleEmpty';
import { getSubjectsForDate, layoutDay, getDayOfWeek, todayIsoDate } from '@/lib/utils/scheduleHelpers';
import { useSwipeNavigation } from '@/lib/hooks/useSwipeNavigation';
import { SLOT_HEIGHT, END_HOUR, DAY_START_MINS } from '@/lib/config/scheduleGrid';
import type { Subject } from '@/lib/types/schedule';
import type { UserEvent } from '@/lib/types/events';

function parseIsoDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function toIsoDate(date: Date): string {
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, '0'),
    String(date.getUTCDate()).padStart(2, '0'),
  ].join('-');
}

interface DayGridProps {
  /** ISO date (YYYY-MM-DD) currently focused. */
  date: string;
  onDateChange: (date: string) => void;
  subjects: Subject[];
  isLoading: boolean;
  hasIdentifier: boolean;
  error?: string | null;
  onRetry?: () => void;
  events: UserEvent[];
  eventsVisible: boolean;
  onEditEvent: (event: UserEvent) => void;
  onDeleteEvent: (id: string) => void;
  canCreate?: boolean;
  onCellClick?: (date: string, time: string) => void;
  ghostCell?: { date: string; time: string } | null;
}

export function DayGrid({
  date,
  onDateChange,
  subjects,
  isLoading,
  hasIdentifier,
  error,
  onRetry,
  events,
  eventsVisible,
  onEditEvent,
  onDeleteEvent,
  canCreate = false,
  onCellClick,
  ghostCell,
}: DayGridProps) {
  const t = useTranslations('schedule');
  const locale = useLocale();

  const isToday = date === todayIsoDate();

  function shiftDay(deltaDays: number) {
    const next = parseIsoDate(date);
    next.setUTCDate(next.getUTCDate() + deltaDays);
    onDateChange(toIsoDate(next));
  }

  function goToToday() {
    onDateChange(todayIsoDate());
  }

  const swipeHandlers = useSwipeNavigation({
    onSwipeLeft: () => shiftDay(1),
    onSwipeRight: () => shiftDay(-1),
  });

  // Current time in px from top of grid — only meaningful when viewing today.
  const [currentTimePx, setCurrentTimePx] = useState<number | null>(null);
  useEffect(() => {
    function update() {
      const now = new Date();
      const mins = now.getHours() * 60 + now.getMinutes();
      if (mins >= DAY_START_MINS && mins <= END_HOUR * 60) {
        setCurrentTimePx(((mins - DAY_START_MINS) / 30) * SLOT_HEIGHT);
      } else {
        setCurrentTimePx(null);
      }
    }
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  const dayDate = useMemo(() => parseIsoDate(date), [date]);

  const daySubjects = useMemo(
    () => layoutDay(getSubjectsForDate(subjects, dayDate)),
    [subjects, dayDate],
  );

  const dayEvents = useMemo(() => events.filter((e) => e.date === date), [events, date]);

  // Skeleton pattern index — purely cosmetic, cycles 1-5 regardless of actual weekday.
  const skeletonDay = getDayOfWeek(dayDate) || 5;

  const dayLabel = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(dayDate);

  const hasError = !!error && !isLoading;
  const isEmpty = !isLoading && !hasError && daySubjects.length === 0;
  const showEmpty = hasError || isEmpty;
  const emptyVariant: ScheduleEmptyVariant = hasError
    ? 'error'
    : !hasIdentifier
      ? 'no-identifier'
      : 'empty-day';

  return (
    <div className="w-full" {...swipeHandlers}>
      {/* Day navigation header */}
      <div className="flex items-center gap-1.5 py-3 px-1">
        <button
          onClick={goToToday}
          className={[
            'px-2.5 py-1 text-xs font-medium rounded-sm',
            'text-accent hover:bg-accent-subtle',
            'transition-[opacity,background-color,transform] transition-smooth active:scale-[0.95]',
            isToday ? 'opacity-0 pointer-events-none' : 'opacity-100',
          ].join(' ')}
        >
          {t('today')}
        </button>

        <div className="flex items-center gap-1.5 sm:ml-auto">
          <button
            onClick={() => shiftDay(-1)}
            aria-label={t('prevDay')}
            title={t('prevDay')}
            className="size-9 sm:size-8 flex items-center justify-center rounded-sm text-secondary hover:text-primary hover:bg-surface-raised transition-[background-color,color,transform] transition-fast active:scale-[0.95]"
          >
            <ChevronLeft size={16} aria-hidden />
          </button>

          <span className="text-sm font-medium text-primary min-w-38 text-center capitalize tabular-nums">
            {dayLabel}
          </span>

          <button
            onClick={() => shiftDay(1)}
            aria-label={t('nextDay')}
            title={t('nextDay')}
            className="size-9 sm:size-8 flex items-center justify-center rounded-sm text-secondary hover:text-primary hover:bg-surface-raised transition-[background-color,color,transform] transition-fast active:scale-[0.95]"
          >
            <ChevronRight size={16} aria-hidden />
          </button>
        </div>
      </div>

      {/* Grid body */}
      <div className="relative flex w-full">
        <TimeLabelsColumn />

        <div className="flex-1">
          <DayColumn
            day={skeletonDay}
            subjects={daySubjects}
            isLoading={isLoading}
            isToday={isToday}
            currentTimePx={currentTimePx}
            events={dayEvents}
            eventsVisible={eventsVisible}
            onEditEvent={onEditEvent}
            onDeleteEvent={onDeleteEvent}
            dateISO={date}
            canCreate={canCreate}
            onCellClick={onCellClick}
            ghostTime={ghostCell?.date === date ? ghostCell.time : null}
          />
        </div>

        {/* Empty / error state overlay (grid lines remain visible per spec) */}
        {showEmpty && (
          <div
            className={`absolute inset-0 flex items-center justify-center ${
              emptyVariant === 'error' ? '' : 'pointer-events-none'
            }`}
          >
            <ScheduleEmpty
              variant={emptyVariant}
              errorMessage={error}
              onRetry={onRetry}
            />
          </div>
        )}
      </div>
    </div>
  );
}

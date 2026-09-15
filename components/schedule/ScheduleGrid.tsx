'use client';

import { useState, useEffect, useMemo } from 'react';
import { ScheduleHeader } from './ScheduleHeader';
import { ScheduleEmpty } from './ScheduleEmpty';
import type { ScheduleEmptyVariant } from './ScheduleEmpty';
import { DayColumn } from './DayColumn';
import { TimeLabelsColumn } from './TimeLabelsColumn';
import {
  getWeekDates,
  getSubjectsForWeek,
  getDayOfWeek,
  getISOWeekFromDate,
  layoutDay,
} from '@/lib/utils/scheduleHelpers';
import type { Subject } from '@/lib/types/schedule';
import type { SubjectWithLayout } from '@/lib/utils/scheduleHelpers';
import type { UserEvent } from '@/lib/types/events';
import { useSwipeNavigation } from '@/lib/hooks/useSwipeNavigation';
import { SLOT_HEIGHT, START_HOUR, END_HOUR, DAY_START_MINS, TIME_COL_WIDTH } from '@/lib/config/scheduleGrid';

const DAYS_MON_FRI = [1, 2, 3, 4, 5] as const;
const DAY_LABELS_SHORT = ['L', 'M', 'X', 'J', 'V'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Get events for a specific date (YYYY-MM-DD) */
function getEventsForDate(events: UserEvent[], dateISO: string): UserEvent[] {
  return events.filter((e) => e.date === dateISO);
}

// ─── ScheduleGrid ─────────────────────────────────────────────────────────────

interface ScheduleGridProps {
  subjects: Subject[];
  isLoading: boolean;
  year: number;
  week: number;
  hasIdentifier: boolean;
  error?: string | null;
  onRetry?: () => void;
  onWeekChange?: (year: number, week: number) => void;
  events: UserEvent[];
  eventsVisible: boolean;
  onEditEvent: (event: UserEvent) => void;
  onDeleteEvent: (id: string) => void;
  canCreate?: boolean;
  onCellClick?: (date: string, time: string) => void;
  ghostCell?: { date: string; time: string } | null;
}

export function ScheduleGrid({
  subjects,
  isLoading,
  year,
  week,
  hasIdentifier,
  error,
  onRetry,
  onWeekChange,
  events,
  eventsVisible,
  onEditEvent,
  onDeleteEvent,
  canCreate = false,
  onCellClick,
  ghostCell,
}: ScheduleGridProps) {

  // Mobile: which day tab is selected (1=Mon … 5=Fri)
  const [selectedDay, setSelectedDay] = useState<number>(() => {
    const d = new Date().getDay();
    return d >= 1 && d <= 5 ? d : 1;
  });

  // Swipe to change week (mobile) — ignores pinch-zoom and vertical scrolling.
  function shiftWeekByDays(days: number) {
    if (!onWeekChange) return;
    const monday = getWeekDates(year, week)[0];
    monday.setUTCDate(monday.getUTCDate() + days);
    const result = getISOWeekFromDate(monday);
    onWeekChange(result.year, result.week);
  }

  const swipeHandlers = useSwipeNavigation({
    onSwipeLeft: () => shiftWeekByDays(7),
    onSwipeRight: () => shiftWeekByDays(-7),
  });

  // Current time in px from top of grid
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

  const weekDates = useMemo(() => getWeekDates(year, week), [year, week]);

  const { year: todayYear, week: todayWeek } = useMemo(
    () => getISOWeekFromDate(new Date()),
    [],
  );
  const isCurrentWeek = year === todayYear && week === todayWeek;

  const todayDayOfWeek = useMemo(() => {
    const d = new Date().getDay();
    return d >= 1 && d <= 5 ? d : -1;
  }, []);

  // Build day → SubjectWithLayout[] map for the displayed week
  const dayMap = useMemo(() => {
    const weekSubs = getSubjectsForWeek(subjects, year, week);
    const map = new Map<number, SubjectWithLayout[]>();
    for (const day of DAYS_MON_FRI) {
      const daySubs = weekSubs.filter((s) => {
        const dow = getDayOfWeek(new Date(s.date.year, s.date.month - 1, s.date.day));
        return dow === day;
      });
      map.set(day, layoutDay(daySubs));
    }
    return map;
  }, [subjects, year, week]);

  // Build day → ISO date string map for the displayed week
  const dayDateMap = useMemo(() => {
    const map = new Map<number, string>();
    for (let i = 0; i < 5; i++) {
      const date = weekDates[i];
      if (!date) continue;
      const iso = [
        date.getUTCFullYear(),
        String(date.getUTCMonth() + 1).padStart(2, '0'),
        String(date.getUTCDate()).padStart(2, '0'),
      ].join('-');
      map.set(i + 1, iso); // 1=Mon … 5=Fri
    }
    return map;
  }, [weekDates]);

  // Build day → events map
  const dayEventsMap = useMemo(() => {
    const map = new Map<number, UserEvent[]>();
    for (const day of DAYS_MON_FRI) {
      const iso = dayDateMap.get(day) ?? '';
      map.set(day, iso ? getEventsForDate(events, iso) : []);
    }
    return map;
  }, [events, dayDateMap]);

  const weekSubs = useMemo(() => getSubjectsForWeek(subjects, year, week), [subjects, year, week]);
  const hasError = !!error && !isLoading;
  const isEmpty = !isLoading && !hasError && weekSubs.length === 0;
  const showEmpty = hasError || isEmpty;
  const emptyVariant: ScheduleEmptyVariant = hasError
    ? 'error'
    : !hasIdentifier
      ? 'no-identifier'
      : 'empty-week';

  return (
    <div className="w-full" {...swipeHandlers}>
      {/* Mobile day tabs */}
      <div className="flex sm:hidden border-b border-subtle">
        {DAY_LABELS_SHORT.map((label, i) => {
          const day = i + 1;
          const isToday = isCurrentWeek && todayDayOfWeek === day;
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`flex-1 py-2 text-sm font-medium transition-colors border-b-2 ${
                selectedDay === day
                  ? 'text-accent border-accent'
                  : 'text-secondary border-transparent hover:text-primary'
              } ${isToday ? 'font-medium' : ''}`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Desktop header */}
      <div className="hidden sm:block">
        <ScheduleHeader dates={weekDates} timeColWidth={TIME_COL_WIDTH} />
      </div>

      {/* Grid body */}
      <div className="relative flex w-full">
        <TimeLabelsColumn />

        {/* Desktop: 5 day columns */}
        <div className="hidden sm:grid flex-1" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
          {DAYS_MON_FRI.map((day) => {
            const dateISO = dayDateMap.get(day) ?? '';
            return (
              <DayColumn
                key={day}
                day={day}
                subjects={dayMap.get(day) ?? []}
                isLoading={isLoading}
                isToday={isCurrentWeek && todayDayOfWeek === day}
                currentTimePx={currentTimePx}
                events={dayEventsMap.get(day) ?? []}
                eventsVisible={eventsVisible}
                onEditEvent={onEditEvent}
                onDeleteEvent={onDeleteEvent}
                dateISO={dateISO}
                canCreate={canCreate}
                onCellClick={onCellClick}
                ghostTime={ghostCell?.date === dateISO ? ghostCell.time : null}
              />
            );
          })}
        </div>

        {/* Mobile: single day column */}
        <div className="sm:hidden flex-1">
          {(() => {
            const dateISO = dayDateMap.get(selectedDay) ?? '';
            return (
              <DayColumn
                day={selectedDay}
                subjects={dayMap.get(selectedDay) ?? []}
                isLoading={isLoading}
                isToday={isCurrentWeek && todayDayOfWeek === selectedDay}
                currentTimePx={currentTimePx}
                events={dayEventsMap.get(selectedDay) ?? []}
                eventsVisible={eventsVisible}
                onEditEvent={onEditEvent}
                onDeleteEvent={onDeleteEvent}
                dateISO={dateISO}
                canCreate={canCreate}
                onCellClick={onCellClick}
                ghostTime={ghostCell?.date === dateISO ? ghostCell.time : null}
              />
            );
          })()}
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

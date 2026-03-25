'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { SubjectBlock } from './SubjectBlock';
import { ScheduleHeader } from './ScheduleHeader';
import {
  getWeekDates,
  getSubjectsForWeek,
  getDayOfWeek,
  getISOWeekFromDate,
  layoutDay,
  timeToMinutes,
} from '@/lib/utils/scheduleHelpers';
import type { Subject } from '@/lib/types/schedule';
import type { SubjectWithLayout } from '@/lib/utils/scheduleHelpers';

// ─── Grid constants ────────────────────────────────────────────────────────────
const SLOT_HEIGHT = 48;    // px per 30-min slot
const START_HOUR = 8;
const END_HOUR = 21;
const SLOTS = (END_HOUR - START_HOUR) * 2; // 26
const TOTAL_HEIGHT = SLOTS * SLOT_HEIGHT;  // 1248
const DAY_START_MINS = START_HOUR * 60;    // 480
const TIME_COL_WIDTH = 52;                 // px for the hour-label column

const HOURS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);
const DAYS_MON_FRI = [1, 2, 3, 4, 5] as const;
const DAY_LABELS_SHORT = ['L', 'M', 'X', 'J', 'V'];

// Fixed skeleton blocks so positions are deterministic (no hydration mismatch)
const SKELETON_BLOCKS: { day: number; startSlot: number; span: number }[] = [
  { day: 1, startSlot: 2,  span: 4 },
  { day: 1, startSlot: 9,  span: 3 },
  { day: 2, startSlot: 2,  span: 4 },
  { day: 2, startSlot: 11, span: 3 },
  { day: 3, startSlot: 4,  span: 4 },
  { day: 3, startSlot: 14, span: 3 },
  { day: 4, startSlot: 2,  span: 4 },
  { day: 4, startSlot: 8,  span: 2 },
  { day: 5, startSlot: 4,  span: 2 },
  { day: 5, startSlot: 10, span: 4 },
];

// ─── DayColumn ─────────────────────────────────────────────────────────────────

interface DayColumnProps {
  day: number;
  subjects: SubjectWithLayout[];
  isLoading: boolean;
  isToday: boolean;
  currentTimePx: number | null;
}

function DayColumn({ day, subjects, isLoading, isToday, currentTimePx }: DayColumnProps) {
  return (
    <div className="relative border-l border-subtle" style={{ height: TOTAL_HEIGHT, minWidth: 0 }}>
      {/* Horizontal grid lines */}
      {Array.from({ length: SLOTS + 1 }, (_, i) => (
        <div
          key={i}
          className={`absolute w-full pointer-events-none ${
            i % 2 === 0 ? 'border-t border-subtle' : ''
          }`}
          style={{ top: i * SLOT_HEIGHT }}
        />
      ))}

      {/* Skeleton */}
      {isLoading &&
        SKELETON_BLOCKS.filter((b) => b.day === day).map((b, i) => (
          <div
            key={i}
            className="absolute rounded-sm bg-surface-raised animate-pulse"
            style={{
              top: b.startSlot * SLOT_HEIGHT + 2,
              height: b.span * SLOT_HEIGHT - 4,
              left: 3,
              right: 3,
            }}
          />
        ))}

      {/* Subject blocks */}
      {!isLoading &&
        subjects.map((s) => (
          <SubjectBlock key={s.id} subject={s} slotHeight={SLOT_HEIGHT} />
        ))}

      {/* Current-time line */}
      {isToday && currentTimePx !== null && (
        <div
          className="absolute w-full z-10 pointer-events-none"
          style={{ top: currentTimePx }}
        >
          <div className="relative border-t-2 border-accent">
            <span className="absolute -top-1.25 -left-1.5 size-2.5 rounded-full bg-accent" />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ScheduleGrid ─────────────────────────────────────────────────────────────

interface ScheduleGridProps {
  subjects: Subject[];
  isLoading: boolean;
  year: number;
  week: number;
  hasIdentifier: boolean;
}

export function ScheduleGrid({
  subjects,
  isLoading,
  year,
  week,
  hasIdentifier,
}: ScheduleGridProps) {
  const t = useTranslations('schedule');

  // Mobile: which day tab is selected (1=Mon … 5=Fri)
  const [selectedDay, setSelectedDay] = useState<number>(() => {
    const d = new Date().getDay();
    return d >= 1 && d <= 5 ? d : 1;
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

  const weekSubs = useMemo(() => getSubjectsForWeek(subjects, year, week), [subjects, year, week]);
  const isEmpty = !isLoading && weekSubs.length === 0;

  return (
    <div className="w-full">
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
        {/* Time labels */}
        <div
          className="relative shrink-0 select-none"
          style={{ width: TIME_COL_WIDTH, height: TOTAL_HEIGHT }}
        >
          {HOURS.map((hour, i) => (
            <div
              key={hour}
              className="absolute right-0 pr-2 text-xs text-tertiary leading-none"
              style={{ top: i * 2 * SLOT_HEIGHT - 5 }}
            >
              {String(hour).padStart(2, '0')}:00
            </div>
          ))}
        </div>

        {/* Desktop: 5 day columns */}
        <div className="hidden sm:grid flex-1" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
          {DAYS_MON_FRI.map((day) => (
            <DayColumn
              key={day}
              day={day}
              subjects={dayMap.get(day) ?? []}
              isLoading={isLoading}
              isToday={isCurrentWeek && todayDayOfWeek === day}
              currentTimePx={currentTimePx}
            />
          ))}
        </div>

        {/* Mobile: single day column */}
        <div className="sm:hidden flex-1">
          <DayColumn
            day={selectedDay}
            subjects={dayMap.get(selectedDay) ?? []}
            isLoading={isLoading}
            isToday={isCurrentWeek && todayDayOfWeek === selectedDay}
            currentTimePx={currentTimePx}
          />
        </div>

        {/* Empty state overlay (grid lines remain visible per spec) */}
        {isEmpty && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-sm text-secondary px-4 text-center">
              {hasIdentifier ? t('emptyWeek') : t('empty')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

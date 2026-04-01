'use client';

import { useMemo, useState, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getISOWeekFromDate } from '@/lib/utils/scheduleHelpers';
import type { Subject } from '@/lib/types/schedule';
import type { UserEvent } from '@/lib/types/events';
import { MonthCell } from './MonthCell';
import { MonthDayDrawer } from './MonthDayDrawer';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getMonthCalendarDays(year: number, month: number): Date[] {
  const firstDay = new Date(Date.UTC(year, month - 1, 1));
  const lastDay = new Date(Date.UTC(year, month, 0));

  const dayOfWeekFirst = firstDay.getUTCDay() || 7; // Mon=1, Sun=7
  const startMonday = new Date(firstDay);
  startMonday.setUTCDate(firstDay.getUTCDate() - (dayOfWeekFirst - 1));

  const dayOfWeekLast = lastDay.getUTCDay() || 7;
  const endSunday = new Date(lastDay);
  endSunday.setUTCDate(lastDay.getUTCDate() + (7 - dayOfWeekLast));

  const days: Date[] = [];
  const d = new Date(startMonday);
  while (d <= endSunday) {
    days.push(new Date(d));
    d.setUTCDate(d.getUTCDate() + 1);
  }
  return days;
}

function getSubjectsForDate(subjects: Subject[], date: Date): Subject[] {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate();
  return subjects.filter((s) => s.date.year === y && s.date.month === m && s.date.day === d);
}

function getEventsForDate(events: UserEvent[], date: Date): UserEvent[] {
  const y = String(date.getUTCFullYear());
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  const iso = `${y}-${m}-${d}`;
  return events.filter((e) => e.date === iso);
}

function checkIsToday(date: Date): boolean {
  const now = new Date();
  return (
    date.getUTCFullYear() === now.getFullYear() &&
    date.getUTCMonth() + 1 === now.getMonth() + 1 &&
    date.getUTCDate() === now.getDate()
  );
}

// ─── Day column headers ───────────────────────────────────────────────────────

const DAY_HEADER_KEYS = [
  'dayMon', 'dayTue', 'dayWed', 'dayThu', 'dayFri', 'daySat', 'daySun',
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

interface MonthGridProps {
  subjects: Subject[];
  isLoading: boolean;
  year: number;
  month: number; // 1-12
  onMonthChange: (year: number, month: number) => void;
  onGoToWeek: (isoYear: number, isoWeek: number) => void;
  events: UserEvent[];
  eventsVisible: boolean;
}

export function MonthGrid({
  subjects,
  isLoading,
  year,
  month,
  onMonthChange,
  onGoToWeek,
  events,
  eventsVisible,
}: MonthGridProps) {
  const t = useTranslations('schedule');
  const locale = useLocale();

  const [drawerDate, setDrawerDate] = useState<Date | null>(null);
  const touchStartXRef = useRef<number | null>(null);

  const days = useMemo(() => getMonthCalendarDays(year, month), [year, month]);

  const now = new Date();
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth() + 1;

  const monthLabel = new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, 1)));

  function shiftMonth(delta: -1 | 1) {
    let newMonth = month + delta;
    let newYear = year;
    if (newMonth < 1) { newMonth = 12; newYear -= 1; }
    if (newMonth > 12) { newMonth = 1; newYear += 1; }
    onMonthChange(newYear, newMonth);
  }

  function goToToday() {
    onMonthChange(now.getFullYear(), now.getMonth() + 1);
  }

  function handleDayClick(date: Date) {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    if (isMobile) {
      setDrawerDate(date);
    } else {
      const { year: wy, week } = getISOWeekFromDate(date);
      onGoToWeek(wy, week);
    }
  }

  // Swipe left/right to navigate months
  function handleTouchStart(e: React.TouchEvent) {
    touchStartXRef.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartXRef.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartXRef.current;
    if (Math.abs(delta) > 50) {
      shiftMonth(delta < 0 ? 1 : -1);
    }
    touchStartXRef.current = null;
  }

  const drawerSubjects = drawerDate ? getSubjectsForDate(subjects, drawerDate) : [];

  return (
    <div
      className="w-full"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Month navigation header */}
      <div className="flex items-center gap-1.5 py-3 px-1">
        <button
          onClick={goToToday}
          className={[
            'px-2.5 py-1 text-xs font-medium rounded-sm',
            'text-accent hover:bg-accent-subtle',
            'transition-[opacity,background-color,transform] transition-smooth active:scale-[0.95]',
            isCurrentMonth ? 'opacity-0 pointer-events-none' : 'opacity-100',
          ].join(' ')}
        >
          {t('today')}
        </button>

        <div className="flex items-center gap-1.5 sm:ml-auto">
          <button
            onClick={() => shiftMonth(-1)}
            aria-label="Previous month"
            className="size-8 flex items-center justify-center rounded-sm text-secondary hover:text-primary hover:bg-surface-raised transition-[background-color,color,transform] transition-fast active:scale-[0.95]"
          >
            <ChevronLeft size={16} />
          </button>

          <span className="text-sm font-medium text-primary min-w-36 text-center capitalize tabular-nums">
            {monthLabel}
          </span>

          <button
            onClick={() => shiftMonth(1)}
            aria-label="Next month"
            className="size-8 flex items-center justify-center rounded-sm text-secondary hover:text-primary hover:bg-surface-raised transition-[background-color,color,transform] transition-fast active:scale-[0.95]"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="border border-subtle rounded-sm overflow-hidden">
        {/* Day column headers */}
        <div className="grid grid-cols-7 border-b border-subtle bg-surface-raised">
          {DAY_HEADER_KEYS.map((key) => (
            <div key={key} className="py-2 text-center text-xs font-medium text-secondary">
              {t(key)}
            </div>
          ))}
        </div>

        {/* Day cells */}
        {isLoading ? (
          <div className="grid grid-cols-7">
            {Array.from({ length: 35 }, (_, i) => (
              <div
                key={i}
                className="border-b border-r border-subtle p-1 min-h-14 sm:min-h-20 lg:min-h-24"
              >
                <div className="flex justify-end mb-1">
                  <div className="w-5 h-5 rounded-full bg-surface-raised animate-pulse" />
                </div>
                {i % 3 !== 0 && (
                  <div className="hidden sm:block h-3 w-4/5 rounded-sm bg-surface-raised animate-pulse mt-1" />
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-7">
            {days.map((date, i) => {
              const cellMonth = date.getUTCMonth() + 1;
              const cellYear = date.getUTCFullYear();
              const isCurrentMonthDay = cellYear === year && cellMonth === month;
              const daySubs = getSubjectsForDate(subjects, date);
              const isSelected =
                drawerDate !== null &&
                drawerDate.getUTCFullYear() === cellYear &&
                drawerDate.getUTCMonth() + 1 === cellMonth &&
                drawerDate.getUTCDate() === date.getUTCDate();

              const dayEvents = getEventsForDate(events, date);
              return (
                <MonthCell
                  key={i}
                  date={date}
                  subjects={daySubs}
                  events={dayEvents}
                  eventsVisible={eventsVisible}
                  isCurrentMonth={isCurrentMonthDay}
                  isToday={checkIsToday(date)}
                  isSelected={isSelected}
                  onClick={() => handleDayClick(date)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Mobile day drawer */}
      <MonthDayDrawer
        date={drawerDate}
        subjects={drawerSubjects}
        onClose={() => setDrawerDate(null)}
      />
    </div>
  );
}

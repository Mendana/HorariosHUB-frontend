'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { ChevronLeft, ChevronRight, CalendarDays, CalendarRange } from 'lucide-react';
import {
  getCurrentWeek,
  getCurrentSemester,
  getNearestWeekInSemester,
  getWeekDates,
  getISOWeekFromDate,
  formatWeekRange,
} from '@/lib/utils/scheduleHelpers';

interface WeekNavigatorProps {
  year: number;
  week: number;
  onWeekChange: (year: number, week: number) => void;
  view: 'week' | 'month';
  onViewChange: (view: 'week' | 'month') => void;
}

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function WeekNavigator({ year, week, onWeekChange, view, onViewChange }: WeekNavigatorProps) {
  const t = useTranslations('schedule');
  const locale = useLocale();

  const [semester, setSemester] = useState<1 | 2>(() => getCurrentSemester());

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const storedSem = readStorage<1 | 2>('selectedSemester', getCurrentSemester());
    const storedYear = readStorage<number>('selectedWeekYear', getCurrentWeek().year);
    const storedWeek = readStorage<number>('selectedWeek', getCurrentWeek().week);
    setSemester(storedSem);
    onWeekChange(storedYear, storedWeek);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSemesterChange = useCallback(
    (sem: 1 | 2) => {
      setSemester(sem);
      localStorage.setItem('selectedSemester', JSON.stringify(sem));
      const nearest = getNearestWeekInSemester(sem);
      localStorage.setItem('selectedWeekYear', JSON.stringify(nearest.year));
      localStorage.setItem('selectedWeek', JSON.stringify(nearest.week));
      onWeekChange(nearest.year, nearest.week);
    },
    [onWeekChange],
  );

  const shiftWeek = useCallback(
    (delta: -1 | 1) => {
      const monday = getWeekDates(year, week)[0];
      monday.setUTCDate(monday.getUTCDate() + delta * 7);
      const result = getISOWeekFromDate(monday);
      localStorage.setItem('selectedWeekYear', JSON.stringify(result.year));
      localStorage.setItem('selectedWeek', JSON.stringify(result.week));
      onWeekChange(result.year, result.week);
    },
    [year, week, onWeekChange],
  );

  const goToToday = useCallback(() => {
    const current = getCurrentWeek();
    localStorage.setItem('selectedWeekYear', JSON.stringify(current.year));
    localStorage.setItem('selectedWeek', JSON.stringify(current.week));
    onWeekChange(current.year, current.week);
  }, [onWeekChange]);

  const current = getCurrentWeek();
  const isCurrentWeek = year === current.year && week === current.week;
  const weekDates = getWeekDates(year, week);
  const rangeLabel = formatWeekRange(weekDates, locale);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-3 px-1">
      {/* Left side: view toggle + semester tabs (week view only) */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* View toggle */}
        <div className="flex rounded-sm overflow-hidden border border-subtle">
          <button
            onClick={() => onViewChange('week')}
            aria-label={t('viewWeek')}
            title={t('viewWeek')}
            className={`px-2.5 py-1.5 flex items-center justify-center transition-[background-color,color,filter] transition-base ${
              view === 'week'
                ? 'bg-accent-subtle text-accent'
                : 'bg-surface-raised text-secondary hover:text-primary hover:brightness-[1.03]'
            }`}
          >
            <CalendarDays size={15} />
          </button>
          <button
            onClick={() => onViewChange('month')}
            aria-label={t('viewMonth')}
            title={t('viewMonth')}
            className={`px-2.5 py-1.5 flex items-center justify-center transition-[background-color,color,filter] transition-base ${
              view === 'month'
                ? 'bg-accent-subtle text-accent'
                : 'bg-surface-raised text-secondary hover:text-primary hover:brightness-[1.03]'
            }`}
          >
            <CalendarRange size={15} />
          </button>
        </div>

        {/* Semester tabs — only in week view */}
        {view === 'week' && (
          <div className="flex rounded-sm overflow-hidden border border-subtle">
            {([1, 2] as const).map((sem) => (
              <button
                key={sem}
                onClick={() => handleSemesterChange(sem)}
                className={`px-3 py-1.5 text-sm font-medium transition-[background-color,color,filter] transition-base ${
                  semester === sem
                    ? 'bg-accent-subtle text-accent'
                    : 'bg-surface-raised text-secondary hover:text-primary hover:brightness-[1.03]'
                }`}
              >
                {t(sem === 1 ? 'semester1' : 'semester2')}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Week navigation — only in week view */}
      {view === 'week' && (
        <div className="flex items-center gap-1.5 sm:ml-auto">
          {/* Today button — always rendered, fades in/out */}
          <button
            onClick={goToToday}
            className={[
              'px-2.5 py-1 text-xs font-medium rounded-sm',
              'text-accent hover:bg-accent-subtle',
              'transition-[opacity,background-color,transform] transition-smooth active:scale-[0.95]',
              isCurrentWeek ? 'opacity-0 pointer-events-none' : 'opacity-100',
            ].join(' ')}
          >
            {t('today')}
          </button>

          <button
            onClick={() => shiftWeek(-1)}
            aria-label="Previous week"
            className="size-8 flex items-center justify-center rounded-sm text-secondary hover:text-primary hover:bg-surface-raised transition-[background-color,color,transform] transition-fast active:scale-[0.95]"
          >
            <ChevronLeft size={16} />
          </button>

          <span className="text-sm font-medium text-primary min-w-37 text-center tabular-nums">
            {rangeLabel}
          </span>

          <button
            onClick={() => shiftWeek(1)}
            aria-label="Next week"
            className="size-8 flex items-center justify-center rounded-sm text-secondary hover:text-primary hover:bg-surface-raised transition-[background-color,color,transform] transition-fast active:scale-[0.95]"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

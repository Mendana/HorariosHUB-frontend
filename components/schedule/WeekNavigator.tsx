'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { ChevronLeft, ChevronRight, CalendarDays, CalendarRange, Flag } from 'lucide-react';
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
  eventsVisible: boolean;
  onToggleEvents: () => void;
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

export function WeekNavigator({ year, week, onWeekChange, view, onViewChange, eventsVisible, onToggleEvents }: WeekNavigatorProps) {
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

  // Keyboard shortcuts — store latest callbacks in refs so the effect closure is always fresh
  const shiftWeekRef = useRef(shiftWeek);
  const handleSemesterChangeRef = useRef(handleSemesterChange);
  const goToTodayRef = useRef(goToToday);
  const isCurrentWeekRef = useRef(false);
  useEffect(() => { shiftWeekRef.current = shiftWeek; }, [shiftWeek]);
  useEffect(() => { handleSemesterChangeRef.current = handleSemesterChange; }, [handleSemesterChange]);
  useEffect(() => { goToTodayRef.current = goToToday; }, [goToToday]);

  const current = getCurrentWeek();
  const isCurrentWeek = year === current.year && week === current.week;
  useEffect(() => { isCurrentWeekRef.current = isCurrentWeek; }, [isCurrentWeek]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (!e.altKey) return;
      // Ignore when focus is inside a text control
      const tag = (document.activeElement as HTMLElement | null)?.tagName ?? '';
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.key === 'ArrowLeft')  { e.preventDefault(); shiftWeekRef.current(-1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); shiftWeekRef.current(1); }
      else if (e.key === 'ArrowUp')    { e.preventDefault(); handleSemesterChangeRef.current(1); }
      else if (e.key === 'ArrowDown')  { e.preventDefault(); handleSemesterChangeRef.current(2); }
      else if (e.key === 'h' || e.key === 'H') {
        if (!isCurrentWeekRef.current) { e.preventDefault(); goToTodayRef.current(); }
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const weekDates = getWeekDates(year, week);
  const rangeLabel = formatWeekRange(weekDates, locale);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-3 px-1">
      {/* Left side: view toggle + semester tabs (week view only) */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* View toggle — patrón "tray": bandeja surface-raised, chip activo
            se eleva a surface-base con shadow-sm. Sin borde exterior. */}
        <div className="flex gap-0.5 p-0.5 rounded-sm bg-surface-raised" role="group" aria-label={t('viewToggleLabel')}>
          <button
            onClick={() => onViewChange('week')}
            aria-label={t('viewWeek')}
            aria-pressed={view === 'week'}
            title={t('viewWeek')}
            className={`px-2.5 py-1.5 flex items-center justify-center rounded-[3px] transition-[background-color,color,box-shadow] transition-base ${
              view === 'week'
                ? 'bg-surface-base text-primary shadow-sm'
                : 'text-secondary hover:text-primary'
            }`}
          >
            <CalendarDays size={15} aria-hidden />
          </button>
          <button
            onClick={() => onViewChange('month')}
            aria-label={t('viewMonth')}
            aria-pressed={view === 'month'}
            title={t('viewMonth')}
            className={`px-2.5 py-1.5 flex items-center justify-center rounded-[3px] transition-[background-color,color,box-shadow] transition-base ${
              view === 'month'
                ? 'bg-surface-base text-primary shadow-sm'
                : 'text-secondary hover:text-primary'
            }`}
          >
            <CalendarRange size={15} aria-hidden />
          </button>
        </div>

        {/* Events toggle */}
        <button
          onClick={onToggleEvents}
          title={t('eventsToggleTooltip')}
          aria-pressed={eventsVisible}
          className={[
            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm border text-xs font-medium',
            'transition-[background-color,color,border-color] transition-base',
            eventsVisible
              ? 'bg-accent-subtle border-accent text-accent'
              : 'bg-surface-raised border-subtle text-tertiary hover:text-primary hover:border-strong',
          ].join(' ')}
        >
          <Flag size={13} aria-hidden />
          <span>{t('eventsToggleLabel')}</span>
        </button>

        {/* Semester tabs — mismo patrón tray */}
        {view === 'week' && (
          <div className="flex gap-0.5 p-0.5 rounded-sm bg-surface-raised" role="group">
            {([1, 2] as const).map((sem) => (
              <button
                key={sem}
                onClick={() => handleSemesterChange(sem)}
                aria-label={t(sem === 1 ? 'semester1' : 'semester2')}
                aria-pressed={semester === sem}
                title={t(sem === 1 ? 'shortcutSem1' : 'shortcutSem2')}
                className={`px-3 py-1.5 text-[13px] font-medium rounded-[3px] transition-[background-color,color,box-shadow] transition-base ${
                  semester === sem
                    ? 'bg-surface-base text-primary shadow-sm'
                    : 'text-secondary hover:text-primary'
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
            title={t('shortcutToday')}
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
            aria-label={t('prevWeek')}
            title={t('shortcutPrevWeek')}
            className="size-8 flex items-center justify-center rounded-sm text-secondary hover:text-primary hover:bg-surface-raised transition-[background-color,color,transform] transition-fast active:scale-[0.95]"
          >
            <ChevronLeft size={16} aria-hidden />
          </button>

          <span className="text-sm font-medium text-primary min-w-37 text-center tabular-nums" aria-live="polite" aria-atomic="true">
            {rangeLabel}
          </span>

          <button
            onClick={() => shiftWeek(1)}
            aria-label={t('nextWeek')}
            title={t('shortcutNextWeek')}
            className="size-8 flex items-center justify-center rounded-sm text-secondary hover:text-primary hover:bg-surface-raised transition-[background-color,color,transform] transition-fast active:scale-[0.95]"
          >
            <ChevronRight size={16} aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
}

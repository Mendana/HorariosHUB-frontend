'use client';

import { useState, useCallback, useEffect } from 'react';
import { getCurrentWeek, getWeekDates, getISOWeekFromDate } from '@/lib/utils/scheduleHelpers';
import { useSchedule, ScheduleRefreshContext } from '@/lib/hooks/useSchedule';
import { ScheduleSearch } from '@/components/schedule/ScheduleSearch';
import { WeekNavigator } from '@/components/schedule/WeekNavigator';
import { ScheduleGrid } from '@/components/schedule/ScheduleGrid';
import { MonthGrid } from '@/components/schedule/MonthGrid';

export default function SchedulePage() {
  const [identifier, setIdentifier] = useState<string | null>(null);

  const initial = getCurrentWeek();
  const [selectedYear, setSelectedYear] = useState(initial.year);
  const [selectedWeek, setSelectedWeek] = useState(initial.week);

  const [scheduleView, setScheduleView] = useState<'week' | 'month'>('week');

  const now = new Date();
  const [viewMonthYear, setViewMonthYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth() + 1);

  // Rehydrate view preference from localStorage after mount
  useEffect(() => {
    const stored = localStorage.getItem('scheduleView');
    if (stored === 'week' || stored === 'month') {
      setScheduleView(stored);
    }
  }, []);

  const { subjects, isLoading, refreshSchedule } = useSchedule(identifier);

  const handleWeekChange = useCallback((year: number, week: number) => {
    setSelectedYear(year);
    setSelectedWeek(week);
  }, []);

  const handleViewChange = useCallback(
    (view: 'week' | 'month') => {
      if (view === 'month' && scheduleView === 'week') {
        const monday = getWeekDates(selectedYear, selectedWeek)[0];
        setViewMonthYear(monday.getUTCFullYear());
        setViewMonth(monday.getUTCMonth() + 1);
      } else if (view === 'week' && scheduleView === 'month') {
        const firstDay = new Date(Date.UTC(viewMonthYear, viewMonth - 1, 1));
        const { year: wy, week: wk } = getISOWeekFromDate(firstDay);
        setSelectedYear(wy);
        setSelectedWeek(wk);
        localStorage.setItem('selectedWeekYear', JSON.stringify(wy));
        localStorage.setItem('selectedWeek', JSON.stringify(wk));
      }
      setScheduleView(view);
      localStorage.setItem('scheduleView', view);
    },
    [scheduleView, selectedYear, selectedWeek, viewMonthYear, viewMonth],
  );

  const handleMonthChange = useCallback((year: number, month: number) => {
    setViewMonthYear(year);
    setViewMonth(month);
  }, []);

  const handleGoToWeek = useCallback((isoYear: number, isoWeek: number) => {
    setSelectedYear(isoYear);
    setSelectedWeek(isoWeek);
    localStorage.setItem('selectedWeekYear', JSON.stringify(isoYear));
    localStorage.setItem('selectedWeek', JSON.stringify(isoWeek));
    setScheduleView('week');
    localStorage.setItem('scheduleView', 'week');
  }, []);

  return (
    <ScheduleRefreshContext.Provider value={refreshSchedule}>
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <ScheduleSearch identifier={identifier} onIdentifierChange={setIdentifier} />
        <WeekNavigator
          year={selectedYear}
          week={selectedWeek}
          onWeekChange={handleWeekChange}
          view={scheduleView}
          onViewChange={handleViewChange}
        />
        {scheduleView === 'week' ? (
          <ScheduleGrid
            subjects={subjects}
            isLoading={isLoading}
            year={selectedYear}
            week={selectedWeek}
            hasIdentifier={identifier !== null}
            onWeekChange={handleWeekChange}
          />
        ) : (
          <MonthGrid
            subjects={subjects}
            isLoading={isLoading}
            year={viewMonthYear}
            month={viewMonth}
            onMonthChange={handleMonthChange}
            onGoToWeek={handleGoToWeek}
          />
        )}
      </div>
    </ScheduleRefreshContext.Provider>
  );
}

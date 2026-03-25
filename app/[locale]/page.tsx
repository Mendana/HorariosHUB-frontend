'use client';

import { useState, useCallback } from 'react';
import { getCurrentWeek } from '@/lib/utils/scheduleHelpers';
import { useSchedule } from '@/lib/hooks/useSchedule';
import { ScheduleSearch } from '@/components/schedule/ScheduleSearch';
import { WeekNavigator } from '@/components/schedule/WeekNavigator';
import { ScheduleGrid } from '@/components/schedule/ScheduleGrid';

export default function SchedulePage() {
  const [identifier, setIdentifier] = useState<string | null>(null);

  const initial = getCurrentWeek();
  const [selectedYear, setSelectedYear] = useState(initial.year);
  const [selectedWeek, setSelectedWeek] = useState(initial.week);

  const { subjects, isLoading } = useSchedule(identifier);

  const handleWeekChange = useCallback((year: number, week: number) => {
    setSelectedYear(year);
    setSelectedWeek(week);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6">
      <ScheduleSearch identifier={identifier} onIdentifierChange={setIdentifier} />
      <WeekNavigator year={selectedYear} week={selectedWeek} onWeekChange={handleWeekChange} />
      <ScheduleGrid
        subjects={subjects}
        isLoading={isLoading}
        year={selectedYear}
        week={selectedWeek}
        hasIdentifier={identifier !== null}
      />
    </div>
  );
}

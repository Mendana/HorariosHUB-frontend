'use client';

import { useState, useEffect } from 'react';
import type { Subject } from '@/lib/types/schedule';
import { timeToMinutes } from '@/lib/utils/scheduleHelpers';

export interface NextClassResult {
  nextClass: Subject | null;
  minutesUntil: number;     // minutes until start (0 if ongoing)
  minutesRemaining: number; // minutes until end (only meaningful if isOngoing)
  isOngoing: boolean;
}

function compute(subjects: Subject[]): NextClassResult {
  const now = new Date();
  const todayYear  = now.getFullYear();
  const todayMonth = now.getMonth() + 1;
  const todayDay   = now.getDate();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const todaySubjects = subjects.filter(
    (s) =>
      s.date.year  === todayYear  &&
      s.date.month === todayMonth &&
      s.date.day   === todayDay,
  );

  // Ongoing: started but not yet ended — show the one ending soonest
  const ongoing = todaySubjects
    .filter((s) => {
      const start = timeToMinutes(s.startTime);
      const end   = timeToMinutes(s.endTime);
      return start <= nowMinutes && nowMinutes < end;
    })
    .sort((a, b) => timeToMinutes(a.endTime) - timeToMinutes(b.endTime));

  if (ongoing.length > 0) {
    const current = ongoing[0];
    return {
      nextClass:        current,
      minutesUntil:     0,
      minutesRemaining: timeToMinutes(current.endTime) - nowMinutes,
      isOngoing:        true,
    };
  }

  // Upcoming: next class that hasn't started yet
  const upcoming = todaySubjects
    .filter((s) => timeToMinutes(s.startTime) > nowMinutes)
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  if (upcoming.length > 0) {
    const next = upcoming[0];
    return {
      nextClass:        next,
      minutesUntil:     timeToMinutes(next.startTime) - nowMinutes,
      minutesRemaining: timeToMinutes(next.endTime) - timeToMinutes(next.startTime),
      isOngoing:        false,
    };
  }

  return { nextClass: null, minutesUntil: 0, minutesRemaining: 0, isOngoing: false };
}

export function useNextClass(subjects: Subject[]): NextClassResult {
  const [result, setResult] = useState<NextClassResult>(() => compute(subjects));

  useEffect(() => {
    setResult(compute(subjects));
    const interval = setInterval(() => setResult(compute(subjects)), 30_000);
    return () => clearInterval(interval);
  }, [subjects]);

  return result;
}

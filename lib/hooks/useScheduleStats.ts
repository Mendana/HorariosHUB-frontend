'use client';

import { useMemo } from 'react';
import type { Subject } from '../types/schedule';
import { timeToMinutes, getISOWeekFromDate, getCurrentWeek } from '../utils/scheduleHelpers';

export interface SubjectHourStat {
  name: string;
  hours: number;
  percentage: number;
}

export interface DayStat {
  /** i18n key, e.g. 'dayMon' — look up in 'schedule' namespace */
  dayKey: string;
  hours: number;
  classes: number;
}

export interface ScheduleStats {
  horasPorSemana: number;
  horasPorAsignatura: SubjectHourStat[];
  distribucionPorDia: DayStat[];
  /** i18n key, e.g. 'dayMon' */
  diaMasOcupado: string;
  /** i18n key, e.g. 'dayFri' — day with fewest (but > 0) hours */
  diaMasLibre: string;
  /** Hours for busiest day (used in stat card label) */
  diaMasOcupadoHoras: number;
  diaMasOcupadoClases: number;
  horaStart: string;
  horaEnd: string;
  totalClases: number;
  totalHoras: number;
  semanaActual: { hours: number; classes: number };
  /** Day key with afternoon free (classes before 14:00 but none after), or null */
  diaConTardeLibre: string | null;
}

const DAY_KEYS = ['dayMon', 'dayTue', 'dayWed', 'dayThu', 'dayFri'] as const;

function durationHours(s: Subject): number {
  return (timeToMinutes(s.endTime) - timeToMinutes(s.startTime)) / 60;
}

function dayIndex(s: Subject): number {
  const d = new Date(s.date.year, s.date.month - 1, s.date.day).getDay();
  // 0=Sun → -1 (skip), 1=Mon → 0, …, 5=Fri → 4, 6=Sat → -1
  return d === 0 || d === 6 ? -1 : d - 1;
}

function filterBySemester(subjects: Subject[], semester: 1 | 2): Subject[] {
  return subjects.filter(({ date: { month } }) =>
    semester === 1 ? month >= 9 || month === 1 : month >= 2 && month <= 6,
  );
}

const EMPTY: ScheduleStats = {
  horasPorSemana: 0,
  horasPorAsignatura: [],
  distribucionPorDia: DAY_KEYS.map((dayKey) => ({ dayKey, hours: 0, classes: 0 })),
  diaMasOcupado: 'dayMon',
  diaMasLibre: 'dayFri',
  diaMasOcupadoHoras: 0,
  diaMasOcupadoClases: 0,
  horaStart: '-',
  horaEnd: '-',
  totalClases: 0,
  totalHoras: 0,
  semanaActual: { hours: 0, classes: 0 },
  diaConTardeLibre: null,
};

export function useScheduleStats(subjects: Subject[], semester: 1 | 2): ScheduleStats {
  return useMemo(() => {
    const filtered = filterBySemester(subjects, semester);
    if (filtered.length === 0) return EMPTY;

    // ── totals ───────────────────────────────────────────────────────────────
    const totalHoras = Math.round(
      filtered.reduce((sum, s) => sum + durationHours(s), 0) * 10,
    ) / 10;
    const totalClases = filtered.length;

    // ── hours per week ───────────────────────────────────────────────────────
    const weekMap = new Map<string, number>();
    for (const s of filtered) {
      const { year, week } = getISOWeekFromDate(
        new Date(s.date.year, s.date.month - 1, s.date.day),
      );
      const key = `${year}-${week}`;
      weekMap.set(key, (weekMap.get(key) ?? 0) + durationHours(s));
    }
    const horasPorSemana =
      weekMap.size > 0
        ? Math.round((totalHoras / weekMap.size) * 10) / 10
        : 0;

    // ── by subject ───────────────────────────────────────────────────────────
    const subjMap = new Map<string, number>();
    for (const s of filtered) {
      subjMap.set(s.name, (subjMap.get(s.name) ?? 0) + durationHours(s));
    }
    const horasPorAsignatura: SubjectHourStat[] = Array.from(subjMap.entries())
      .map(([name, hours]) => ({
        name,
        hours: Math.round(hours * 10) / 10,
        percentage: Math.round((hours / totalHoras) * 100),
      }))
      .sort((a, b) => b.hours - a.hours);

    // ── by day ───────────────────────────────────────────────────────────────
    const dayHours = [0, 0, 0, 0, 0];
    const dayClasses = [0, 0, 0, 0, 0];
    const dayAfternoon = [false, false, false, false, false]; // has class after 14:00
    const dayMorning = [false, false, false, false, false];   // has class before 14:00

    for (const s of filtered) {
      const idx = dayIndex(s);
      if (idx < 0 || idx > 4) continue;
      dayHours[idx] += durationHours(s);
      dayClasses[idx]++;
      if (timeToMinutes(s.startTime) < 14 * 60) dayMorning[idx] = true;
      if (timeToMinutes(s.endTime) > 14 * 60) dayAfternoon[idx] = true;
    }

    const distribucionPorDia: DayStat[] = DAY_KEYS.map((dayKey, i) => ({
      dayKey,
      hours: Math.round(dayHours[i] * 10) / 10,
      classes: dayClasses[i],
    }));

    // busiest day
    let maxH = -1, maxIdx = 0;
    let minH = Infinity, minIdx = 0;
    for (let i = 0; i < 5; i++) {
      if (dayHours[i] > maxH) { maxH = dayHours[i]; maxIdx = i; }
      if (dayHours[i] > 0 && dayHours[i] < minH) { minH = dayHours[i]; minIdx = i; }
    }

    // free afternoon: has morning classes but no afternoon classes
    const diaConTardeLibre =
      DAY_KEYS.find((_, i) => dayMorning[i] && !dayAfternoon[i]) ?? null;

    // ── time bounds ──────────────────────────────────────────────────────────
    let minTime = '23:59', maxTime = '00:00';
    for (const s of filtered) {
      if (s.startTime < minTime) minTime = s.startTime;
      if (s.endTime > maxTime) maxTime = s.endTime;
    }

    // ── current week ─────────────────────────────────────────────────────────
    const { year: cwYear, week: cwWeek } = getCurrentWeek();
    const cwSubjects = filtered.filter((s) => {
      const { year, week } = getISOWeekFromDate(
        new Date(s.date.year, s.date.month - 1, s.date.day),
      );
      return year === cwYear && week === cwWeek;
    });
    const semanaActual = {
      hours: Math.round(cwSubjects.reduce((sum, s) => sum + durationHours(s), 0) * 10) / 10,
      classes: cwSubjects.length,
    };

    return {
      horasPorSemana,
      horasPorAsignatura,
      distribucionPorDia,
      diaMasOcupado: DAY_KEYS[maxIdx],
      diaMasLibre: minH === Infinity ? DAY_KEYS[4] : DAY_KEYS[minIdx],
      diaMasOcupadoHoras: Math.round(maxH * 10) / 10,
      diaMasOcupadoClases: dayClasses[maxIdx],
      horaStart: minTime,
      horaEnd: maxTime,
      totalClases,
      totalHoras,
      semanaActual,
      diaConTardeLibre: diaConTardeLibre ?? null,
    };
  }, [subjects, semester]);
}

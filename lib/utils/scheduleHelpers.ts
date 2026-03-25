import type { Subject } from '../types/schedule';

// ─── Time helpers ─────────────────────────────────────────────────────────────

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/** Returns ISO week { year, week } for a given Date. The year may differ from
 *  the calendar year at year boundaries (ISO week year). */
export function getISOWeekFromDate(date: Date): { year: number; week: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7; // Mon=1 … Sun=7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum); // nearest Thursday
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((d.getTime() - yearStart.getTime()) / 86_400_000) + 1) / 7);
  return { year: d.getUTCFullYear(), week };
}

export function getCurrentWeek(): { year: number; week: number } {
  return getISOWeekFromDate(new Date());
}

/** Returns the Monday–Friday dates for a given ISO year + week number. */
export function getWeekDates(isoYear: number, isoWeek: number): Date[] {
  const jan4 = new Date(Date.UTC(isoYear, 0, 4));
  const jan4DayOfWeek = jan4.getUTCDay() || 7;
  const thursdayOffset = 4 - jan4DayOfWeek + (isoWeek - 1) * 7;
  const thursday = new Date(Date.UTC(isoYear, 0, 4 + thursdayOffset));
  const monday = new Date(thursday);
  monday.setUTCDate(thursday.getUTCDate() - 3);
  return Array.from({ length: 5 }, (_, i) => {
    const d = new Date(monday);
    d.setUTCDate(monday.getUTCDate() + i);
    return d;
  });
}

/** Day of week: Mon=1 … Fri=5. Returns 0 for Sat/Sun. */
export function getDayOfWeek(date: Date): number {
  const d = date.getDay(); // 0=Sun
  if (d === 0 || d === 6) return 0;
  return d;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

// ─── Filtering ────────────────────────────────────────────────────────────────

export function getSubjectsForWeek(
  subjects: Subject[],
  isoYear: number,
  isoWeek: number,
): Subject[] {
  return subjects.filter((s) => {
    const { year, week } = getISOWeekFromDate(
      new Date(s.date.year, s.date.month - 1, s.date.day),
    );
    return year === isoYear && week === isoWeek;
  });
}

export function isCurrentlyOngoing(subject: Subject): boolean {
  const now = new Date();
  const today = {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  };
  if (
    subject.date.year !== today.year ||
    subject.date.month !== today.month ||
    subject.date.day !== today.day
  ) {
    return false;
  }
  const nowMins = now.getHours() * 60 + now.getMinutes();
  return nowMins >= timeToMinutes(subject.startTime) && nowMins < timeToMinutes(subject.endTime);
}

// ─── Layout (overlap resolution) ─────────────────────────────────────────────

export interface SubjectWithLayout extends Subject {
  col: number;
  totalCols: number;
}

/**
 * Given the subjects for a single day, assigns col/totalCols so overlapping
 * blocks render side-by-side (50/50 for 2, 33/33/33 for 3).
 */
export function layoutDay(subjects: Subject[]): SubjectWithLayout[] {
  const sorted = [...subjects].sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime),
  );

  const result: SubjectWithLayout[] = [];

  for (const s of sorted) {
    const startS = timeToMinutes(s.startTime);
    const endS = timeToMinutes(s.endTime);

    // Columns already claimed by subjects that overlap with s
    const takenCols = new Set<number>();
    for (const placed of result) {
      const startP = timeToMinutes(placed.startTime);
      const endP = timeToMinutes(placed.endTime);
      const overlaps = startS < endP && endS > startP;
      if (overlaps) takenCols.add(placed.col);
    }

    let col = 0;
    while (takenCols.has(col)) col++;

    result.push({ ...s, col, totalCols: 1 }); // totalCols fixed below
  }

  // Fix totalCols: every subject in a collision group gets the same value
  for (const s of result) {
    const startS = timeToMinutes(s.startTime);
    const endS = timeToMinutes(s.endTime);
    const group = result.filter((r) => {
      const startR = timeToMinutes(r.startTime);
      const endR = timeToMinutes(r.endTime);
      return startS < endR && endS > startR;
    });
    const maxCols = Math.max(...group.map((g) => g.col + 1));
    s.totalCols = maxCols;
  }

  return result;
}

// ─── Semester detection ───────────────────────────────────────────────────────

export function getCurrentSemester(): 1 | 2 {
  const month = new Date().getMonth() + 1; // 1-12
  return month >= 9 || month <= 1 ? 1 : 2;
}

/** Returns the week closest to today within the target semester. */
export function getNearestWeekInSemester(
  semester: 1 | 2,
): { year: number; week: number } {
  const now = new Date();
  const currentSem = getCurrentSemester();
  if (semester === currentSem) return getISOWeekFromDate(now);

  if (semester === 1) {
    // Jump to Sep 15 of current or previous year
    const year = now.getMonth() + 1 < 9 ? now.getFullYear() - 1 : now.getFullYear();
    return getISOWeekFromDate(new Date(year, 8, 15));
  } else {
    // Jump to Feb 1 of current or next year
    const year = now.getMonth() + 1 >= 9 ? now.getFullYear() + 1 : now.getFullYear();
    return getISOWeekFromDate(new Date(year, 1, 1));
  }
}

// ─── Formatting ───────────────────────────────────────────────────────────────

export function formatWeekRange(dates: Date[], locale: string): string {
  const fmt = (d: Date, opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(locale, opts).format(d);
  const startDay = dates[0].getUTCDate();
  const endDay = dates[4].getUTCDate();
  const month = fmt(dates[4], { month: 'short', timeZone: 'UTC' });
  const year = dates[4].getUTCFullYear();
  return `${startDay} – ${endDay} ${month} ${year}`;
}

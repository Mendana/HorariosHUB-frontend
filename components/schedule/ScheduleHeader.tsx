'use client';

import { useTranslations } from 'next-intl';
import { isSameDay } from '@/lib/utils/scheduleHelpers';

const DAY_KEYS = ['dayMon', 'dayTue', 'dayWed', 'dayThu', 'dayFri'] as const;

interface ScheduleHeaderProps {
  dates: Date[];
  timeColWidth: number; // px — must match the time label column width
}

export function ScheduleHeader({ dates, timeColWidth }: ScheduleHeaderProps) {
  const t = useTranslations('schedule');
  const today = new Date();

  return (
    <div
      className="flex border-b border-subtle bg-surface-base sticky top-16 z-20"
      aria-hidden
    >
      {/* Empty cell aligned with the time-label column */}
      <div style={{ width: timeColWidth, flexShrink: 0 }} />

      {dates.map((date, i) => {
        const isToday = isSameDay(date, today);
        return (
          <div
            key={i}
            className="flex-1 flex flex-col items-center py-2 gap-0.5"
          >
            <span
              className={`text-xs font-medium ${isToday ? 'text-accent' : 'text-secondary'}`}
            >
              {t(DAY_KEYS[i])}
            </span>
            <span
              className={`text-sm font-medium leading-none ${
                isToday
                  ? 'bg-accent text-white rounded-full w-6 h-6 flex items-center justify-center'
                  : 'text-primary'
              }`}
            >
              {date.getUTCDate()}
            </span>
          </div>
        );
      })}
    </div>
  );
}

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
      className="flex border-b border-strong bg-surface-base sticky top-16 z-20"
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
            {/* Día abreviado: uppercase + tracking amplio — estilo Linear */}
            <span className="text-[10px] font-medium tracking-label text-tertiary leading-none">
              {t(DAY_KEYS[i])}
            </span>

            {/* Número de día: jerarquía por tamaño, sin píldora */}
            <span
              className={`text-[17px] font-semibold leading-none tracking-tight ${
                isToday ? 'text-accent' : 'text-primary'
              }`}
            >
              {date.getUTCDate()}
            </span>

            {/* Dot indicator: solo hoy, debajo del número */}
            {isToday ? (
              <span className="size-1 rounded-full bg-accent mt-0.5" />
            ) : (
              <span className="size-1 mt-0.5 opacity-0" aria-hidden />
            )}
          </div>
        );
      })}
    </div>
  );
}

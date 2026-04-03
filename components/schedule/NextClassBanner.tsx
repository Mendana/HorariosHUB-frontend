'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useNextClass } from '@/lib/hooks/useNextClass';
import type { Subject } from '@/lib/types/schedule';

interface NextClassBannerProps {
  subjects: Subject[];
  isCurrentWeek: boolean;
  scheduleView: 'week' | 'month';
}

type BannerState = 'ongoing' | 'soon' | 'upcoming' | 'hidden';

function getBannerState(
  nextClass: Subject | null,
  minutesUntil: number,
  isOngoing: boolean,
): BannerState {
  if (!nextClass)          return 'hidden';
  if (isOngoing)           return 'ongoing';
  if (minutesUntil < 30)   return 'soon';
  if (minutesUntil <= 120) return 'upcoming';
  return 'hidden';
}

function formatDuration(
  minutes: number,
  t: ReturnType<typeof useTranslations<'schedule'>>,
): string {
  if (minutes < 60) return t('nextClassTimeMin', { minutes });
  const hours = Math.floor(minutes / 60);
  const mins  = minutes % 60;
  return t('nextClassTimeHrMin', { hours, minutes: mins });
}

const SEP = <span className="opacity-40 select-none mx-0.5">·</span>;

export function NextClassBanner({ subjects, isCurrentWeek, scheduleView }: NextClassBannerProps) {
  const t = useTranslations('schedule');
  const { nextClass, minutesUntil, minutesRemaining, isOngoing } = useNextClass(subjects);

  const bannerState = getBannerState(nextClass, minutesUntil, isOngoing);
  const shouldShow  = bannerState !== 'hidden' && isCurrentWeek && scheduleView === 'week';

  // Fade in/out: keep rendered during fade-out transition
  const [rendered, setRendered] = useState(false);
  const [visible,  setVisible]  = useState(false);

  useEffect(() => {
    if (shouldShow) {
      setRendered(true);
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    } else {
      setVisible(false);
      const timer = setTimeout(() => setRendered(false), 250);
      return () => clearTimeout(timer);
    }
  }, [shouldShow]);

  if (!rendered || !nextClass) return null;

  // ── Color tokens per state ──────────────────────────────────────────────────
  const colorMap = {
    ongoing:  { bg: 'bg-success-subtle', text: 'text-success', border: 'border-success', dot: 'bg-success' },
    soon:     { bg: 'bg-warning-subtle', text: 'text-warning', border: 'border-warning', dot: 'bg-warning' },
    upcoming: { bg: 'bg-accent-subtle',  text: 'text-accent',  border: 'border-accent',  dot: 'bg-accent'  },
  } as const;

  const { bg, text, border, dot } = colorMap[bannerState as keyof typeof colorMap];

  // ── Build segments: [label] · [name] · [classroom?] · [extra] ──────────────
  const timeRange = `${nextClass.startTime}–${nextClass.endTime}`;

  let label: string;
  // Segments after the label: { value, muted?, bold? }
  type Seg = { value: string; muted?: boolean; bold?: boolean; truncate?: boolean };
  let segs: Seg[] = [];

  if (bannerState === 'ongoing') {
    label = t('nextClassOngoingLabel');
    segs = [
      { value: nextClass.name, bold: true },
      ...(nextClass.classroom ? [{ value: nextClass.classroom, truncate: true }] : []),
      { value: t('nextClassEndsIn', { time: formatDuration(minutesRemaining, t) }), bold: true },
    ];
  } else if (bannerState === 'soon') {
    label = t('nextClassSoonPrefix', { time: formatDuration(minutesUntil, t) });
    segs = [
      { value: nextClass.name, bold: true },
      ...(nextClass.classroom ? [{ value: nextClass.classroom, truncate: true }] : []),
      { value: timeRange, bold: true },
    ];
  } else {
    // upcoming
    label = t('nextClassUpcomingLabel');
    segs = [
      { value: nextClass.name, bold: true },
      { value: timeRange },
      { value: t('nextClassInTime', { time: formatDuration(minutesUntil, t) }), bold: true },
    ];
  }

  return (
    <div
      style={{ opacity: visible ? 1 : 0 }}
      className={`transition-opacity transition-smooth border-b ${bg} ${border}`}
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-10 flex items-center gap-1.5 min-w-0">

        {/* Pulsing status dot */}
        <span className={`size-1.5 rounded-full animate-pulse shrink-0 ${dot}`} aria-hidden />

        {/* Label */}
        <span className={`text-sm font-medium shrink-0 ${text}`}>{label}</span>

        {/* Segments with separators */}
        {segs.map((seg, i) => (
          <span key={i} className="flex items-center gap-1.5 min-w-0">
            {SEP}
            <span
              className={[
                'text-sm',
                seg.bold    ? 'font-medium' : '',
                seg.truncate ? 'truncate min-w-0' : 'shrink-0',
                text,
                !seg.bold ? 'opacity-80' : '',
              ].filter(Boolean).join(' ')}
            >
              {seg.value}
            </span>
          </span>
        ))}

      </div>
    </div>
  );
}

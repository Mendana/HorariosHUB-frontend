'use client';

import { useEffect, useState } from 'react';
import { CalendarX, WifiOff } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export type ScheduleEmptyVariant = 'no-identifier' | 'empty-week' | 'error';

interface ScheduleEmptyProps {
  variant: ScheduleEmptyVariant;
  errorMessage?: string | null;
  onRetry?: () => void;
}

// 5 columns × 4 rows grid illustration
function EmptyGridSVG() {
  const COLS = 5;
  const ROWS = 4;
  const W = 20;
  const H = 15;
  const GAP_X = 4;
  const GAP_Y = 4;
  const svgW = COLS * W + (COLS - 1) * GAP_X; // 116
  const svgH = ROWS * H + (ROWS - 1) * GAP_Y; // 72

  return (
    <svg
      width={svgW}
      height={svgH}
      viewBox={`0 0 ${svgW} ${svgH}`}
      fill="none"
      aria-hidden="true"
    >
      {Array.from({ length: COLS }, (_, col) =>
        Array.from({ length: ROWS }, (_, row) => (
          <rect
            key={`${col}-${row}`}
            x={col * (W + GAP_X)}
            y={row * (H + GAP_Y)}
            width={W}
            height={H}
            rx={2}
            stroke="var(--border-subtle)"
            strokeWidth={1}
          />
        ))
      )}
    </svg>
  );
}

export function ScheduleEmpty({ variant, errorMessage, onRetry }: ScheduleEmptyProps) {
  const t = useTranslations('schedule');
  const { user } = useAuth();

  // Fade-in on mount and on variant change
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setVisible(false);
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, [variant]);

  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 py-16 px-4 text-center
        transition-opacity transition-smooth ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      {variant === 'no-identifier' && (
        <>
          <EmptyGridSVG />
          <div className="flex flex-col items-center gap-2">
            <p className="text-[17px] font-medium leading-snug text-primary">
              {t('emptyTitle')}
            </p>
            <p className="text-[14px] text-secondary max-w-xs">
              {t('emptySubtitle')}
            </p>
          </div>
        </>
      )}

      {variant === 'empty-week' && (
        <>
          <CalendarX size={32} className="text-tertiary shrink-0" />
          <div className="flex flex-col items-center gap-1">
            <p className="text-[14px] font-medium text-secondary">
              {t('emptyWeek')}
            </p>
            <p className="text-[12px] text-tertiary max-w-xs">
              {t('emptyWeekSubtitle')}
            </p>
          </div>
          {user !== null && (
            <Link
              href="/my-subjects"
              className="text-[12px] text-accent hover:text-accent-hover
                transition-colors transition-base"
            >
              {t('emptyWeekMySubjects')}
            </Link>
          )}
        </>
      )}

      {variant === 'error' && (
        <>
          <WifiOff size={32} className="text-error shrink-0" />
          <div className="flex flex-col items-center gap-1">
            <p className="text-[14px] font-medium text-primary">
              {t('errorTitle')}
            </p>
            {errorMessage && (
              <p className="text-[12px] text-tertiary max-w-xs">{errorMessage}</p>
            )}
          </div>
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-[12px] px-3 py-1.5 rounded-sm border border-subtle text-secondary
                hover:border-strong hover:bg-surface-raised
                transition-[border-color,background-color] transition-base"
            >
              {t('errorRetry')}
            </button>
          )}
        </>
      )}
    </div>
  );
}

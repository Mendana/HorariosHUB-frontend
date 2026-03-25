'use client';

import { useTheme } from '@/hooks/useTheme';
import { getSubjectColor } from '@/lib/config/subjectColors';
import { timeToMinutes, isCurrentlyOngoing } from '@/lib/utils/scheduleHelpers';
import type { SubjectWithLayout } from '@/lib/utils/scheduleHelpers';

const GRID_START_MINS = 8 * 60; // 08:00

interface SubjectBlockProps {
  subject: SubjectWithLayout;
  slotHeight: number; // px per 30-min slot
}

export function SubjectBlock({ subject, slotHeight }: SubjectBlockProps) {
  const { theme } = useTheme();
  const color = getSubjectColor(subject.name);

  const startMins = timeToMinutes(subject.startTime);
  const endMins = timeToMinutes(subject.endTime);
  const durationSlots = (endMins - startMins) / 30;

  const top = ((startMins - GRID_START_MINS) / 30) * slotHeight;
  const height = durationSlots * slotHeight;

  const colFraction = 1 / subject.totalCols;
  const leftPct = subject.col * colFraction * 100;
  const widthCalc = `calc(${colFraction * 100}% - ${subject.totalCols > 1 ? '3px' : '1px'})`;

  const isShort = height < 56;
  const ongoing = isCurrentlyOngoing(subject);

  return (
    <div
      className="absolute overflow-hidden rounded-sm pl-2 pr-1 pt-0.5 cursor-default select-none z-[1] hover:brightness-95 transition-[filter] duration-100"
      style={{
        top,
        height,
        left: `${leftPct}%`,
        width: widthCalc,
        borderLeft: `3px solid ${color.border}`,
        backgroundColor: theme === 'dark' ? color.bgDark : color.bgLight,
      }}
    >
      {ongoing && (
        <span
          className="absolute top-1 right-1 size-1.5 rounded-full bg-accent animate-pulse"
          aria-hidden
        />
      )}

      <p className="text-xs font-medium text-primary leading-tight truncate">
        {subject.name}
      </p>

      {!isShort && (
        <p className="text-xs text-secondary leading-tight truncate">
          {subject.type}
          {subject.classroom ? ` · ${subject.classroom}` : ''}
        </p>
      )}
    </div>
  );
}

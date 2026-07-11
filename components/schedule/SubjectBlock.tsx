'use client';

import { useState, useRef, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { getSubjectColorVars } from '@/lib/config/subjectColors';
import { timeToMinutes, isCurrentlyOngoing } from '@/lib/utils/scheduleHelpers';
import type { SubjectWithLayout } from '@/lib/utils/scheduleHelpers';
import type { Class } from '@/lib/types/classes';
import { useAuth } from '@/hooks/useAuth';
import { SubjectPopover } from './SubjectPopover';
import { ClassForm } from '@/components/classes/ClassForm';
import { ClassDeleteConfirm } from '@/components/classes/ClassDeleteConfirm';

const GRID_START_MINS = 8 * 60; // 08:00

type BlockState = null | 'popover' | 'editing' | 'deleting';

function subjectToClass(s: SubjectWithLayout): Class {
  const durationMinutes = timeToMinutes(s.endTime) - timeToMinutes(s.startTime);
  return {
    id: s.id,
    name: s.name.split(' - ')[0].trim(),
    classroom: s.classroom || undefined,
    date: s.date,
    startTime: s.startTime,
    endTime: s.endTime,
    durationMinutes,
  };
}

interface SubjectBlockProps {
  subject: SubjectWithLayout;
  slotHeight: number; // px per 30-min slot
  highlighted?: boolean;
}

export function SubjectBlock({ subject, slotHeight, highlighted = false }: SubjectBlockProps) {
  const [blockState, setBlockState] = useState<BlockState>(null);
  const blockRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const canManage = user?.role === 'profesor' || user?.role === 'admin';

  // Scroll into view and play the brightness-pulse animation when highlighted
  useEffect(() => {
    if (!highlighted || !blockRef.current) return;
    blockRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    blockRef.current.classList.add('subject-highlight');
    const id = setTimeout(() => blockRef.current?.classList.remove('subject-highlight'), 1300);
    return () => clearTimeout(id);
  }, [highlighted]);

  const colorVars = getSubjectColorVars(subject.name);
  const ongoing = isCurrentlyOngoing(subject);

  // Layout calculations
  const startMins = timeToMinutes(subject.startTime);
  const endMins = timeToMinutes(subject.endTime);
  const durationSlots = (endMins - startMins) / 30;
  const top = ((startMins - GRID_START_MINS) / 30) * slotHeight;
  const height = durationSlots * slotHeight;

  const colFraction = 1 / subject.totalCols;
  const leftPct = subject.col * colFraction * 100;
  const widthCalc = `calc(${colFraction * 100}% - ${subject.totalCols > 1 ? '3px' : '1px'})`;

  const isVeryShort = height < 50; // only name fits
  const isShort = height < 80; // name + classroom fit, no time

  // When the class is ongoing, swap in the more-intense background vars so that
  // [background-color:var(--sb-bg)] automatically picks up the active value.
  const effectiveVars: Record<string, string> = ongoing
    ? { ...colorVars, '--sb-bg': colorVars['--sb-bg-active'], '--sb-bg-dark': colorVars['--sb-bg-dark-active'] }
    : colorVars;

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setBlockState('popover');
    }
  }

  return (
    <>
      {/* ── Block ─────────────────────────────────────────────────────────── */}
      <div
        ref={blockRef}
        role="button"
        tabIndex={0}
        aria-label={`${subject.name}, ${subject.startTime}–${subject.endTime}`}
        aria-expanded={blockState === 'popover'}
        onClick={() => setBlockState('popover')}
        onKeyDown={handleKeyDown}
        style={{
          ...effectiveVars,
          top,
          height,
          left: `${leftPct}%`,
          width: widthCalc,
          // Border-left uses the saturated color directly — same hue in both themes
          borderLeftColor: colorVars['--sb-border'],
          // Ongoing: widen the accent stripe to 4px; default 3px comes from the class
          ...(ongoing && { borderLeftWidth: '4px' }),
          // Stagger entry by time slot — blocks earlier in the day appear first.
          // Each 30-min slot adds 4ms: 08:00 → 0ms, 20:00 → ~96ms.
          animationDelay: `${Math.round((startMins - GRID_START_MINS) / 30 * 4)}ms`,
        } as React.CSSProperties}
        className={[
          // Position & shape
          'absolute z-1 select-none cursor-pointer overflow-hidden',
          'rounded-r-sm', // left corners are square (flat against the color stripe)
          // Padding — right side leaves room for corner indicators
          'pl-2 pt-1 pb-0.5 pr-1',
          // Outer border: 1px on top/right/bottom, 3px on left (overridden in style for 4px when ongoing)
          'border-y border-r border-subtle [border-left-width:3px]',
          // Background via CSS vars (dark: variant swaps to --sb-bg-dark)
          'bg-(--sb-bg) dark:bg-(--sb-bg-dark)',
          // Shadow: sm at rest, md when ongoing or hovering
          ongoing ? 'shadow-md' : 'shadow-sm',
          // Hover: darken + 1px lift (el bloque "sube a encontrarte")
          'hover:shadow-md hover:brightness-[0.94] hover:-translate-y-px',
          // Active/press: slight scale-down (spec: 0.98)
          'active:scale-[0.98]',
          // Transitions: box-shadow + filter (brightness) + scale + translate
          'transition-[box-shadow,filter,scale,translate] transition-base',
          // Entry animation (stagger delay via inline animationDelay)
          'animate-block-in',
        ].join(' ')}
      >
        {/* ── Corner indicators (ongoing pulse) ────────────────────────────── */}
        {ongoing && (
          <div className="absolute top-1 right-1 flex flex-col items-end pointer-events-none">
            <span
              className="size-1.5 rounded-full bg-accent animate-pulse"
              aria-hidden
            />
          </div>
        )}

        {/* ── Content ─────────────────────────────────────────────────────── */}
        <p className="text-xs font-medium text-primary leading-tight truncate pr-4">
          {subject.name}
        </p>

        {!isVeryShort && (
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin size={10} className="text-tertiary shrink-0" aria-hidden />
            <p className="text-xs text-secondary leading-tight truncate">
              {subject.classroom || '—'}
            </p>
          </div>
        )}

        {!isShort && (
          <p className="text-xs text-tertiary leading-tight mt-0.5 tabular-nums">
            {subject.startTime}–{subject.endTime}
          </p>
        )}
      </div>

      {/* ── Popover ───────────────────────────────────────────────────────── */}
      {blockState === 'popover' && (
        <SubjectPopover
          subject={subject}
          anchorRef={blockRef}
          onClose={() => setBlockState(null)}
          onEdit={canManage ? () => setBlockState('editing') : undefined}
          onDelete={canManage ? () => setBlockState('deleting') : undefined}
        />
      )}

      {/* ── Edit modal (professor / admin only) ──────────────────────────── */}
      {blockState === 'editing' && canManage && (
        <ClassForm
          initial={subjectToClass(subject)}
          onSubmit={async () => setBlockState(null)}
          onClose={() => setBlockState(null)}
        />
      )}

      {/* ── Delete confirm modal (professor / admin only) ─────────────────── */}
      {blockState === 'deleting' && canManage && (
        <ClassDeleteConfirm
          cls={subjectToClass(subject)}
          onConfirm={async () => setBlockState(null)}
          onClose={() => setBlockState(null)}
        />
      )}
    </>
  );
}

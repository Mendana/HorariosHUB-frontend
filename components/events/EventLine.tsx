'use client';

import { useRef, useState } from 'react';
import { ArrowUp, ArrowDown, Repeat } from 'lucide-react';
import type { DisplayEvent } from '@/lib/types/events';
import { EventPopover } from './EventPopover';

// All events render in a single flat color — the backend model dropped the
// old "type" taxonomy (delivery/deadline/reminder/other).
export const EVENT_CSS_COLOR = 'var(--accent)';
export const EVENT_TEXT_CLS = 'text-accent';

// ─── Grid constants (must match ScheduleGrid) ────────────────────────────────
const SLOT_HEIGHT    = 36;
const DAY_START_MIN  = 8 * 60;   // 480
const DAY_END_MIN    = 21 * 60;  // 1260
const TOTAL_SLOTS    = (DAY_END_MIN - DAY_START_MIN) / 30; // 26
const GRID_HEIGHT_PX = TOTAL_SLOTS * SLOT_HEIGHT;          // 936

export function timeToTopPx(time: string): number {
  const [h, m] = time.split(':').map(Number);
  const mins   = h * 60 + m;
  return ((mins - DAY_START_MIN) / 30) * SLOT_HEIGHT;
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

// ─── Component ─────────────────────────────────────────────────────────────

interface EventLineProps {
  event: DisplayEvent;
  /** Vertical offset for stacking same-time events (0, 1, 2, …) */
  stackIndex?: number;
  onEdit:   (event: DisplayEvent) => void;
  onDelete: (event: DisplayEvent) => void;
}

export function EventLine({ event, stackIndex = 0, onEdit, onDelete }: EventLineProps) {
  const dotRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const eventMins    = timeToMinutes(event.time);
  const isBeforeGrid = eventMins < DAY_START_MIN;
  const isAfterGrid  = eventMins >= DAY_END_MIN;
  const isOutOfRange = isBeforeGrid || isAfterGrid;

  // Clamp position to grid edges for out-of-range events;
  // stack downward from top (before) or upward from bottom (after).
  let topPx: number;
  if (isBeforeGrid) {
    topPx = stackIndex * 14;
  } else if (isAfterGrid) {
    topPx = GRID_HEIGHT_PX - (stackIndex + 1) * 14;
  } else {
    topPx = timeToTopPx(event.time) + stackIndex * 14;
  }

  return (
    <>
      <div
        className="absolute left-0 right-0 flex items-center cursor-pointer group"
        style={{ top: topPx, zIndex: 15 }}
        onClick={() => setOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(true); } }}
        aria-label={event.title}
      >
        {/* Out-of-range direction arrow */}
        {isBeforeGrid && (
          <ArrowUp
            size={10}
            style={{ color: EVENT_CSS_COLOR, marginLeft: 2, marginRight: 2, flexShrink: 0 }}
            aria-hidden
          />
        )}
        {isAfterGrid && (
          <ArrowDown
            size={10}
            style={{ color: EVENT_CSS_COLOR, marginLeft: 2, marginRight: 2, flexShrink: 0 }}
            aria-hidden
          />
        )}

        {/* Dot */}
        <div
          ref={dotRef}
          className="shrink-0 rounded-full transition-[width,height] transition-fast"
          style={{
            width:           6,
            height:          6,
            backgroundColor: EVENT_CSS_COLOR,
            marginLeft:      isOutOfRange ? 0 : 2,
            marginRight:     4,
          }}
        />

        {/* Horizontal line */}
        <div
          className="flex-1 h-px pointer-events-none"
          style={{ backgroundColor: EVENT_CSS_COLOR, opacity: 0.6 }}
          aria-hidden
        />

        {/* Label — hidden when there's no horizontal space */}
        <span
          className={[
            'absolute left-4 text-[11px] font-medium leading-none',
            'whitespace-nowrap select-none pointer-events-none',
            'opacity-0 group-hover:opacity-0',
            EVENT_TEXT_CLS,
          ].join(' ')}
          aria-hidden
        >
          {event.title}{isOutOfRange ? ` [${event.time}]` : ''}
        </span>
      </div>

      {/* Visible label — sits just to the right of the dot, above the line */}
      <div
        className="absolute flex items-center pointer-events-none"
        style={{ top: topPx - 9, left: 12, zIndex: 16 }}
        aria-hidden
      >
        {event.isRecurring && (
          <Repeat size={9} className={`${EVENT_TEXT_CLS} shrink-0 mr-0.5`} aria-hidden />
        )}
        <span className={['text-[11px] font-medium leading-none truncate max-w-32', EVENT_TEXT_CLS].join(' ')}>
          {event.title}
        </span>
        {isOutOfRange && (
          <span
            className="text-[10px] leading-none ml-1"
            style={{ color: 'var(--text-tertiary)' }}
          >
            [{event.time}]
          </span>
        )}
      </div>

      {open && (
        <EventPopover
          event={event}
          anchorRef={dotRef}
          onClose={() => setOpen(false)}
          onEdit={(ev) => { setOpen(false); onEdit(ev); }}
          onDelete={(ev) => { setOpen(false); onDelete(ev); }}
        />
      )}
    </>
  );
}

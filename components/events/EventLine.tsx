'use client';

import { useRef, useState } from 'react';
import type { UserEvent, EventType } from '@/lib/types/events';
import { EventPopover } from './EventPopover';

// ─── Color map by event type ────────────────────────────────────────────────
// Uses semantic CSS variables from globals.css

export const EVENT_TYPE_COLOR: Record<EventType, { css: string; tailwindText: string }> = {
  delivery: { css: 'var(--warning)',        tailwindText: 'text-warning'   },
  deadline: { css: 'var(--error)',          tailwindText: 'text-error'     },
  reminder: { css: 'var(--accent)',         tailwindText: 'text-accent'    },
  other:    { css: 'var(--text-secondary)', tailwindText: 'text-secondary' },
};

// ─── Grid constant (must match ScheduleGrid) ─────────────────────────────────
const SLOT_HEIGHT   = 48;
const DAY_START_MIN = 8 * 60; // 480

export function timeToTopPx(time: string): number {
  const [h, m] = time.split(':').map(Number);
  const mins   = h * 60 + m;
  return ((mins - DAY_START_MIN) / 30) * SLOT_HEIGHT;
}

// ─── Component ─────────────────────────────────────────────────────────────

interface EventLineProps {
  event: UserEvent;
  /** Vertical offset for stacking same-time events (0, 1, 2, …) */
  stackIndex?: number;
  onEdit:   (event: UserEvent) => void;
  onDelete: (id: string) => void;
}

export function EventLine({ event, stackIndex = 0, onEdit, onDelete }: EventLineProps) {
  const color      = EVENT_TYPE_COLOR[event.type];
  const cssColor   = event.color ?? color.css;
  const textCls    = event.color ? '' : color.tailwindText;
  const dotRef     = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  // Each stacked event is offset by 14px (dot height 10px + gap 4px)
  const topPx  = timeToTopPx(event.time) + stackIndex * 14;

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
        {/* Dot */}
        <div
          ref={dotRef}
          className="shrink-0 rounded-full transition-[width,height] transition-fast"
          style={{
            width:           6,
            height:          6,
            backgroundColor: cssColor,
            marginLeft:      2,
            marginRight:     4,
          }}
        />

        {/* Horizontal line */}
        <div
          className="flex-1 h-px pointer-events-none"
          style={{ backgroundColor: cssColor, opacity: 0.6 }}
          aria-hidden
        />

        {/* Label — hidden when there's no horizontal space */}
        <span
          className={[
            'absolute left-4 text-[11px] font-medium leading-none',
            'whitespace-nowrap select-none pointer-events-none',
            'opacity-0 group-hover:opacity-0',
            textCls,
          ].join(' ')}
          style={event.color ? { color: cssColor } : {}}
          aria-hidden
        >
          {event.title}
        </span>
      </div>

      {/* Visible label — sits just to the right of the dot, above the line */}
      <div
        className="absolute flex items-center pointer-events-none"
        style={{ top: topPx - 9, left: 12, zIndex: 16 }}
        aria-hidden
      >
        <span
          className={['text-[11px] font-medium leading-none truncate max-w-32', textCls].join(' ')}
          style={event.color ? { color: cssColor } : {}}
        >
          {event.title}
        </span>
      </div>

      {open && (
        <EventPopover
          event={event}
          anchorRef={dotRef}
          onClose={() => setOpen(false)}
          onEdit={(ev) => { setOpen(false); onEdit(ev); }}
          onDelete={(id) => { setOpen(false); onDelete(id); }}
        />
      )}
    </>
  );
}

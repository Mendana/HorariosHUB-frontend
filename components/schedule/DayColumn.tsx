'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import { SubjectBlock } from './SubjectBlock';
import { EventLine } from '@/components/events/EventLine';
import { timeToMinutes } from '@/lib/utils/scheduleHelpers';
import type { SubjectWithLayout } from '@/lib/utils/scheduleHelpers';
import type { UserEvent } from '@/lib/types/events';
import {
  SLOT_HEIGHT,
  SLOTS,
  TOTAL_HEIGHT,
  DAY_START_MINS,
  SKELETON_BLOCKS,
} from '@/lib/config/scheduleGrid';

/** Get events for a specific date (YYYY-MM-DD), stacked by time */
function getEventsForDate(events: UserEvent[], dateISO: string): UserEvent[] {
  return events.filter((e) => e.date === dateISO);
}

/** Build stacking index map: events at the same time get consecutive indices */
function buildStackMap(events: UserEvent[]): Map<string, number> {
  const timeCount = new Map<string, number>();
  const result    = new Map<string, number>();
  for (const ev of events) {
    const idx = timeCount.get(ev.time) ?? 0;
    result.set(ev.id, idx);
    timeCount.set(ev.time, idx + 1);
  }
  return result;
}

export interface DayColumnProps {
  /** 1=Mon … 5=Fri. Purely cosmetic — picks which fixed skeleton pattern to show while loading. */
  day: number;
  subjects: SubjectWithLayout[];
  isLoading: boolean;
  isToday: boolean;
  currentTimePx: number | null;
  events: UserEvent[];
  eventsVisible: boolean;
  onEditEvent: (event: UserEvent) => void;
  onDeleteEvent: (id: string) => void;
  dateISO: string;
  canCreate: boolean;
  onCellClick?: (date: string, time: string) => void;
  ghostTime?: string | null;
}

export function DayColumn({
  day,
  subjects,
  isLoading,
  isToday,
  currentTimePx,
  events,
  eventsVisible,
  onEditEvent,
  onDeleteEvent,
  dateISO,
  canCreate,
  onCellClick,
  ghostTime,
}: DayColumnProps) {
  const t = useTranslations('schedule');
  const stackMap = useMemo(() => buildStackMap(events), [events]);

  // Ghost block position (1 hour = 2 slots tall)
  const ghostTop = ghostTime !== null && ghostTime !== undefined
    ? ((timeToMinutes(ghostTime) - DAY_START_MINS) / 30) * SLOT_HEIGHT
    : null;

  return (
    <div className="relative border-l border-subtle" style={{ height: TOTAL_HEIGHT, minWidth: 0 }}>
      {/* Today column tint — subtle accent stripe for the current day */}
      {isToday && (
        <div className="absolute inset-0 bg-accent/3 pointer-events-none" aria-hidden />
      )}

      {/* Horizontal grid lines — horas completas a full opacity, medias horas a 40% */}
      {Array.from({ length: SLOTS + 1 }, (_, i) => (
        <div
          key={i}
          className={`absolute w-full pointer-events-none border-t ${
            i % 2 === 0 ? 'border-subtle' : 'border-subtle/40'
          }`}
          style={{ top: i * SLOT_HEIGHT }}
        />
      ))}

      {/* Cell create overlays — professor/admin only, hidden during loading */}
      {canCreate && !isLoading && Array.from({ length: SLOTS }, (_, i) => {
        const mins = DAY_START_MINS + i * 30;
        const time = `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
        return (
          <div
            key={`cell-${i}`}
            role="button"
            tabIndex={0}
            aria-label={t('createClassAt', { time })}
            className="absolute w-full cursor-crosshair group/cell transition-colors transition-fast hover:bg-accent/5 focus-visible:bg-accent/5"
            style={{ top: i * SLOT_HEIGHT, height: SLOT_HEIGHT, zIndex: 0 }}
            onClick={() => onCellClick?.(dateISO, time)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onCellClick?.(dateISO, time);
              }
            }}
          >
            <Plus
              size={14}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-accent opacity-0 group-hover/cell:opacity-40 group-focus-visible/cell:opacity-40 transition-opacity transition-fast pointer-events-none"
              aria-hidden
            />
          </div>
        );
      })}

      {/* Skeleton — rounded-r-sm + borde izquierdo anticipa la forma del bloque real */}
      {isLoading &&
        SKELETON_BLOCKS.filter((b) => b.day === day).map((b, i) => (
          <div
            key={i}
            className="absolute rounded-r-sm bg-surface-raised animate-pulse border-l-[3px] border-strong/30"
            style={{
              top: b.startSlot * SLOT_HEIGHT + 2,
              height: b.span * SLOT_HEIGHT - 4,
              left: 3,
              right: 3,
            }}
          />
        ))}

      {/* Ghost block — shown between cell click and modal close */}
      {ghostTop !== null && (
        <div
          className="absolute rounded-sm border border-dashed border-accent bg-accent-subtle pointer-events-none"
          style={{ top: ghostTop + 1, height: SLOT_HEIGHT * 2 - 2, left: 3, right: 3, zIndex: 2 }}
          aria-hidden
        />
      )}

      {/* Subject blocks */}
      {!isLoading &&
        subjects.map((s) => (
          <SubjectBlock
            key={s.id}
            subject={s}
            slotHeight={SLOT_HEIGHT}
          />
        ))}

      {/* Event lines — rendered above subjects, below popovers */}
      {!isLoading && eventsVisible &&
        events.map((ev) => (
          <EventLine
            key={ev.id}
            event={ev}
            stackIndex={stackMap.get(ev.id) ?? 0}
            onEdit={onEditEvent}
            onDelete={onDeleteEvent}
          />
        ))}

      {/* Current-time line — accent stripe + dot + glow para presencia visual */}
      {isToday && currentTimePx !== null && (
        <div
          className="absolute w-full z-10 pointer-events-none"
          style={{ top: currentTimePx }}
        >
          <div
            className="relative border-t-2 border-accent"
            style={{ filter: 'drop-shadow(0 0 4px var(--accent))' }}
          >
            <span className="absolute -top-1.25 -left-1.5 size-2.5 rounded-full bg-accent" />
          </div>
        </div>
      )}
    </div>
  );
}

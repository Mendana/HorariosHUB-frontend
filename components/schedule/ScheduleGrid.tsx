'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import { SubjectBlock } from './SubjectBlock';
import { ScheduleHeader } from './ScheduleHeader';
import { ScheduleEmpty } from './ScheduleEmpty';
import type { ScheduleEmptyVariant } from './ScheduleEmpty';
import {
  getWeekDates,
  getSubjectsForWeek,
  getDayOfWeek,
  getISOWeekFromDate,
  layoutDay,
  timeToMinutes,
} from '@/lib/utils/scheduleHelpers';
import type { Subject } from '@/lib/types/schedule';
import type { SubjectWithLayout } from '@/lib/utils/scheduleHelpers';
import type { UserEvent } from '@/lib/types/events';
import { EventLine } from '@/components/events/EventLine';

// ─── Grid constants ────────────────────────────────────────────────────────────
const SLOT_HEIGHT = 36;    // px per 30-min slot
const START_HOUR = 8;
const END_HOUR = 21;
const SLOTS = (END_HOUR - START_HOUR) * 2; // 26
const TOTAL_HEIGHT = SLOTS * SLOT_HEIGHT;  // 1248
const DAY_START_MINS = START_HOUR * 60;    // 480
const TIME_COL_WIDTH = 52;                 // px for the hour-label column

const HOURS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);
const DAYS_MON_FRI = [1, 2, 3, 4, 5] as const;
const DAY_LABELS_SHORT = ['L', 'M', 'X', 'J', 'V'];

// Fixed skeleton blocks so positions are deterministic (no hydration mismatch)
const SKELETON_BLOCKS: { day: number; startSlot: number; span: number }[] = [
  { day: 1, startSlot: 2,  span: 4 },
  { day: 1, startSlot: 9,  span: 3 },
  { day: 2, startSlot: 2,  span: 4 },
  { day: 2, startSlot: 11, span: 3 },
  { day: 3, startSlot: 4,  span: 4 },
  { day: 3, startSlot: 14, span: 3 },
  { day: 4, startSlot: 2,  span: 4 },
  { day: 4, startSlot: 8,  span: 2 },
  { day: 5, startSlot: 4,  span: 2 },
  { day: 5, startSlot: 10, span: 4 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── DayColumn ─────────────────────────────────────────────────────────────────

interface DayColumnProps {
  day: number;
  subjects: SubjectWithLayout[];
  isLoading: boolean;
  isToday: boolean;
  currentTimePx: number | null;
  highlightedId?: string | null;
  events: UserEvent[];
  eventsVisible: boolean;
  onEditEvent: (event: UserEvent) => void;
  onDeleteEvent: (id: string) => void;
  dateISO: string;
  canCreate: boolean;
  onCellClick?: (date: string, time: string) => void;
  ghostTime?: string | null;
}

function DayColumn({
  day,
  subjects,
  isLoading,
  isToday,
  currentTimePx,
  highlightedId,
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
        <div className="absolute inset-0 bg-accent/[0.03] pointer-events-none" aria-hidden />
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
            highlighted={s.id === highlightedId}
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

// ─── ScheduleGrid ─────────────────────────────────────────────────────────────

interface ScheduleGridProps {
  subjects: Subject[];
  isLoading: boolean;
  year: number;
  week: number;
  hasIdentifier: boolean;
  error?: string | null;
  onRetry?: () => void;
  onWeekChange?: (year: number, week: number) => void;
  highlightedId?: string | null;
  events: UserEvent[];
  eventsVisible: boolean;
  onEditEvent: (event: UserEvent) => void;
  onDeleteEvent: (id: string) => void;
  canCreate?: boolean;
  onCellClick?: (date: string, time: string) => void;
  ghostCell?: { date: string; time: string } | null;
}

export function ScheduleGrid({
  subjects,
  isLoading,
  year,
  week,
  hasIdentifier,
  error,
  onRetry,
  onWeekChange,
  highlightedId,
  events,
  eventsVisible,
  onEditEvent,
  onDeleteEvent,
  canCreate = false,
  onCellClick,
  ghostCell,
}: ScheduleGridProps) {

  // Mobile: which day tab is selected (1=Mon … 5=Fri)
  const [selectedDay, setSelectedDay] = useState<number>(() => {
    const d = new Date().getDay();
    return d >= 1 && d <= 5 ? d : 1;
  });

  // Swipe to change week (mobile)
  const touchStartXRef = useRef<number | null>(null);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartXRef.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartXRef.current === null || !onWeekChange) return;
    const delta = e.changedTouches[0].clientX - touchStartXRef.current;
    if (Math.abs(delta) > 50) {
      const monday = getWeekDates(year, week)[0];
      monday.setUTCDate(monday.getUTCDate() + (delta < 0 ? 7 : -7));
      const result = getISOWeekFromDate(monday);
      onWeekChange(result.year, result.week);
    }
    touchStartXRef.current = null;
  }

  // Current time in px from top of grid
  const [currentTimePx, setCurrentTimePx] = useState<number | null>(null);

  useEffect(() => {
    function update() {
      const now = new Date();
      const mins = now.getHours() * 60 + now.getMinutes();
      if (mins >= DAY_START_MINS && mins <= END_HOUR * 60) {
        setCurrentTimePx(((mins - DAY_START_MINS) / 30) * SLOT_HEIGHT);
      } else {
        setCurrentTimePx(null);
      }
    }
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  const weekDates = useMemo(() => getWeekDates(year, week), [year, week]);

  const { year: todayYear, week: todayWeek } = useMemo(
    () => getISOWeekFromDate(new Date()),
    [],
  );
  const isCurrentWeek = year === todayYear && week === todayWeek;

  const todayDayOfWeek = useMemo(() => {
    const d = new Date().getDay();
    return d >= 1 && d <= 5 ? d : -1;
  }, []);

  // Build day → SubjectWithLayout[] map for the displayed week
  const dayMap = useMemo(() => {
    const weekSubs = getSubjectsForWeek(subjects, year, week);
    const map = new Map<number, SubjectWithLayout[]>();
    for (const day of DAYS_MON_FRI) {
      const daySubs = weekSubs.filter((s) => {
        const dow = getDayOfWeek(new Date(s.date.year, s.date.month - 1, s.date.day));
        return dow === day;
      });
      map.set(day, layoutDay(daySubs));
    }
    return map;
  }, [subjects, year, week]);

  // Build day → ISO date string map for the displayed week
  const dayDateMap = useMemo(() => {
    const map = new Map<number, string>();
    for (let i = 0; i < 5; i++) {
      const date = weekDates[i];
      if (!date) continue;
      const iso = [
        date.getUTCFullYear(),
        String(date.getUTCMonth() + 1).padStart(2, '0'),
        String(date.getUTCDate()).padStart(2, '0'),
      ].join('-');
      map.set(i + 1, iso); // 1=Mon … 5=Fri
    }
    return map;
  }, [weekDates]);

  // Build day → events map
  const dayEventsMap = useMemo(() => {
    const map = new Map<number, UserEvent[]>();
    for (const day of DAYS_MON_FRI) {
      const iso = dayDateMap.get(day) ?? '';
      map.set(day, iso ? getEventsForDate(events, iso) : []);
    }
    return map;
  }, [events, dayDateMap]);

  const weekSubs = useMemo(() => getSubjectsForWeek(subjects, year, week), [subjects, year, week]);
  const hasError = !!error && !isLoading;
  const isEmpty = !isLoading && !hasError && weekSubs.length === 0;
  const showEmpty = hasError || isEmpty;
  const emptyVariant: ScheduleEmptyVariant = hasError
    ? 'error'
    : !hasIdentifier
      ? 'no-identifier'
      : 'empty-week';

  return (
    <div className="w-full" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {/* Mobile day tabs */}
      <div className="flex sm:hidden border-b border-subtle">
        {DAY_LABELS_SHORT.map((label, i) => {
          const day = i + 1;
          const isToday = isCurrentWeek && todayDayOfWeek === day;
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`flex-1 py-2 text-sm font-medium transition-colors border-b-2 ${
                selectedDay === day
                  ? 'text-accent border-accent'
                  : 'text-secondary border-transparent hover:text-primary'
              } ${isToday ? 'font-medium' : ''}`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Desktop header */}
      <div className="hidden sm:block">
        <ScheduleHeader dates={weekDates} timeColWidth={TIME_COL_WIDTH} />
      </div>

      {/* Grid body */}
      <div className="relative flex w-full">
        {/* Time labels */}
        <div
          className="relative shrink-0 select-none"
          style={{ width: TIME_COL_WIDTH, height: TOTAL_HEIGHT }}
        >
          {HOURS.map((hour, i) => (
            <div
              key={hour}
              className="absolute right-0 pr-2 text-xs text-tertiary leading-none"
              style={{ top: i * 2 * SLOT_HEIGHT - 5 }}
            >
              {String(hour).padStart(2, '0')}:00
            </div>
          ))}
        </div>

        {/* Desktop: 5 day columns */}
        <div className="hidden sm:grid flex-1" style={{ gridTemplateColumns: 'repeat(5, 1fr)' }}>
          {DAYS_MON_FRI.map((day) => {
            const dateISO = dayDateMap.get(day) ?? '';
            return (
              <DayColumn
                key={day}
                day={day}
                subjects={dayMap.get(day) ?? []}
                isLoading={isLoading}
                isToday={isCurrentWeek && todayDayOfWeek === day}
                currentTimePx={currentTimePx}
                highlightedId={highlightedId}
                events={dayEventsMap.get(day) ?? []}
                eventsVisible={eventsVisible}
                onEditEvent={onEditEvent}
                onDeleteEvent={onDeleteEvent}
                dateISO={dateISO}
                canCreate={canCreate}
                onCellClick={onCellClick}
                ghostTime={ghostCell?.date === dateISO ? ghostCell.time : null}
              />
            );
          })}
        </div>

        {/* Mobile: single day column */}
        <div className="sm:hidden flex-1">
          {(() => {
            const dateISO = dayDateMap.get(selectedDay) ?? '';
            return (
              <DayColumn
                day={selectedDay}
                subjects={dayMap.get(selectedDay) ?? []}
                isLoading={isLoading}
                isToday={isCurrentWeek && todayDayOfWeek === selectedDay}
                currentTimePx={currentTimePx}
                highlightedId={highlightedId}
                events={dayEventsMap.get(selectedDay) ?? []}
                eventsVisible={eventsVisible}
                onEditEvent={onEditEvent}
                onDeleteEvent={onDeleteEvent}
                dateISO={dateISO}
                canCreate={canCreate}
                onCellClick={onCellClick}
                ghostTime={ghostCell?.date === dateISO ? ghostCell.time : null}
              />
            );
          })()}
        </div>

        {/* Empty / error state overlay (grid lines remain visible per spec) */}
        {showEmpty && (
          <div
            className={`absolute inset-0 flex items-center justify-center ${
              emptyVariant === 'error' ? '' : 'pointer-events-none'
            }`}
          >
            <ScheduleEmpty
              variant={emptyVariant}
              errorMessage={error}
              onRetry={onRetry}
            />
          </div>
        )}
      </div>
    </div>
  );
}

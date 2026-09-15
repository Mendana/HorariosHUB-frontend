import { HOURS, SLOT_HEIGHT, TIME_COL_WIDTH, TOTAL_HEIGHT } from '@/lib/config/scheduleGrid';

/** Hour labels (08:00…21:00) running down the left edge of a schedule grid. */
export function TimeLabelsColumn() {
  return (
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
  );
}

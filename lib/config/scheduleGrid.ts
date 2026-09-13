// ─── Grid constants — shared between ScheduleGrid (week) and DayGrid (day) ────

export const SLOT_HEIGHT = 36;    // px per 30-min slot
export const START_HOUR = 8;
export const END_HOUR = 21;
export const SLOTS = (END_HOUR - START_HOUR) * 2; // 26
export const TOTAL_HEIGHT = SLOTS * SLOT_HEIGHT;  // 1248
export const DAY_START_MINS = START_HOUR * 60;    // 480
export const TIME_COL_WIDTH = 52;                 // px for the hour-label column

export const HOURS = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

// Fixed skeleton blocks so positions are deterministic (no hydration mismatch)
export const SKELETON_BLOCKS: { day: number; startSlot: number; span: number }[] = [
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

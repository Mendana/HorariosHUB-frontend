export type EventRecurrenceInterval = 'daily' | 'weekly' | 'biweekly' | 'monthly';

export interface EventRecurrence {
  interval: EventRecurrenceInterval;
  /** ISO date (YYYY-MM-DD) — last day an occurrence can fall on. */
  endDate: string;
}

/** GET /events, GET/POST/PATCH /events/{id} — a raw event definition. */
export interface EventItem {
  id: string;
  title: string;
  description: string | null;
  subject: string;
  groups: string[];
  startTime: string; // ISO datetime
  endTime: string;   // ISO datetime
  classroom: string | null;
  recurrence: EventRecurrence | null;
  createdBy: string;
  createdAt: string;
}

/** One expanded occurrence from GET /events/occurrences. */
export interface EventOccurrence {
  eventId: string;
  title: string;
  description: string | null;
  subject: string;
  groups: string[];
  classroom: string | null;
  startTime: string; // ISO datetime
  endTime: string;   // ISO datetime
  isRecurring: boolean;
}

export interface EventInput {
  title: string;
  description?: string;
  subject: string;
  groups?: string[];
  startTime: string;
  endTime: string;
  classroom?: string;
  recurrence?: EventRecurrence;
}

/** PATCH /events/{id} — same fields, all optional; omitted fields are left untouched. */
export type EventPatchInput = Partial<EventInput>;

export interface EventsListResponse {
  events: EventItem[];
  total: number;
}

export interface EventOccurrencesResponse {
  occurrences: EventOccurrence[];
}

/**
 * An occurrence mapped into the wall-clock date/time shape the schedule grid
 * already renders (same convention as Subject — see lib/api/schedule.ts).
 * `id` carries the parent event's id, since editing/deleting always acts on
 * the whole event definition, never a single occurrence.
 */
export interface DisplayEvent {
  id: string;
  title: string;
  description: string | null;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM — start
  endTime: string; // HH:MM
  subject: string;
  groups: string[];
  classroom: string | null;
  isRecurring: boolean;
}

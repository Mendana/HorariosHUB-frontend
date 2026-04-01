export type EventType = 'delivery' | 'deadline' | 'reminder' | 'other';

export interface UserEvent {
  id: string;
  title: string;
  description?: string;
  /** ISO date string YYYY-MM-DD */
  date: string;
  /** HH:MM (24-hour) */
  time: string;
  type: EventType;
  /** Optional user-chosen override color (CSS color string) */
  color?: string;
}

export interface NewEventData {
  title: string;
  description?: string;
  date: string;
  time: string;
  type: EventType;
  color?: string;
}

export type SessionType = 'teoria' | 'laboratorio' | 'practica' | 'tutoria' | 'otros';

export interface WeekStat {
  iso_year: number;
  iso_week: number;
  week_start: string;
  week_end: string;
  hours: number;
}

export interface UserMetrics {
  total_hours: number;
  weekly_average_hours: number;
  by_weekday: { weekday: number; hours: number; class_count: number }[];
  days_without_class: number[];
  by_type: { session_type: SessionType; hours: number; class_count: number }[];
  by_subject: { subject: string; hours: number; percentage: number }[];
  earliest_start_time: string | null;
  latest_end_time: string | null;
  busiest_week: WeekStat | null;
  lightest_week: WeekStat | null;
  completed_classes: number;
  remaining_classes: number;
  semesters: {
    semester_1: { total_hours: number; class_count: number; weekly_average_hours: number };
    semester_2: { total_hours: number; class_count: number; weekly_average_hours: number };
  } | null;
}

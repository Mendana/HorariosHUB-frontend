export interface SubjectDate {
  year: number;
  month: number;
  day: number;
}

/** Matches GET /api/schedule/{identifier} response item exactly. */
export interface Subject {
  id: string;
  name: string;
  group: string;
  classroom: string;
  date: SubjectDate;
  startTime: string; // "HH:MM"
  endTime: string;   // "HH:MM"
}

export interface ScheduleResponse {
  subjects: Subject[];
}

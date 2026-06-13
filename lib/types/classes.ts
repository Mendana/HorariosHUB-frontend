export type ClassType = "Teoría" | "Práctica" | "Examen" | "Otros";

export interface ClassesFilter {
  search?: string;
  type?: string;
  week?: string;
  sort?: 'name' | 'type' | 'date';
  dir?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ClassDate {
  year: number;
  month: number;
  day: number;
}

export interface Class {
  id: string;
  name: string;
  type: ClassType;
  classroom?: string;
  date: ClassDate;
  startTime: string; // "09:00"
  endTime: string; // "10:30"
  durationMinutes: number;
}

export interface ClassInput {
  name: string;
  type: ClassType;
  classroom?: string;
  date: ClassDate;
  startTime: string;
  durationMinutes: number;
}

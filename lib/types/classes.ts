export interface ClassesFilter {
  search?: string;
  week?: string;
  sort?: 'name' | 'date';
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
  groupId?: string;
  classroom?: string;
  date: ClassDate;
  startTime: string; // "09:00"
  endTime: string; // "10:30"
  durationMinutes: number;
}

export interface ClassInput {
  name: string;
  groupId?: string;
  classroom?: string;
  date: ClassDate;
  startTime: string;
  durationMinutes: number;
}

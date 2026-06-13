import type { Class, ClassInput, ClassType, ClassesFilter } from '../types/classes';
import { apiFetch } from './apiFetch';

interface BackendClass {
  id: string;
  subject: string;
  subject_type: string;
  classroom?: string;
  start_time: string;
  end_time: string;
}

interface BackendClassInput {
  subject?: string;
  subject_type?: string;
  classroom?: string;
  start_time?: string;
  end_time?: string;
}

function toIso(date: { year: number; month: number; day: number }, time: string): string {
  const [h, m] = time.split(':').map(Number);
  return new Date(Date.UTC(date.year, date.month - 1, date.day, h, m)).toISOString();
}

function toBackendInput(input: Partial<ClassInput>): BackendClassInput {
  const body: BackendClassInput = {};
  if (input.name) body.subject = input.name;
  if (input.type) body.subject_type = input.type;
  if ('classroom' in input) body.classroom = input.classroom;
  if (input.date && input.startTime && input.durationMinutes !== undefined) {
    body.start_time = toIso(input.date, input.startTime);
    body.end_time = new Date(new Date(body.start_time).getTime() + input.durationMinutes * 60_000).toISOString();
  }
  return body;
}

function fromBackend(c: BackendClass): Class {
  const start = new Date(c.start_time);
  const end = new Date(c.end_time);
  return {
    id: c.id,
    name: c.subject,
    type: c.subject_type as ClassType,
    classroom: c.classroom,
    date: {
      year: start.getUTCFullYear(),
      month: start.getUTCMonth() + 1,
      day: start.getUTCDate(),
    },
    startTime: `${String(start.getUTCHours()).padStart(2, '0')}:${String(start.getUTCMinutes()).padStart(2, '0')}`,
    endTime: `${String(end.getUTCHours()).padStart(2, '0')}:${String(end.getUTCMinutes()).padStart(2, '0')}`,
    durationMinutes: (end.getTime() - start.getTime()) / 60_000,
  };
}

export async function fetchClasses(params: ClassesFilter): Promise<{ classes: Class[]; total: number }> {
  const qs = new URLSearchParams();
  if (params.search) qs.set('search', params.search);
  if (params.type) qs.set('type', params.type);
  if (params.week) qs.set('week', params.week);
  if (params.sort) qs.set('sort', params.sort);
  if (params.dir) qs.set('dir', params.dir);
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));

  const data = await apiFetch<{ classes: BackendClass[]; total: number }>(
    `/classes?${qs.toString()}`
  );
  return { classes: data.classes.map(fromBackend), total: data.total };
}

export async function createClass(input: ClassInput): Promise<Class> {
  const data = await apiFetch<BackendClass>('/classes', {
    method: 'POST',
    body: JSON.stringify(toBackendInput(input)),
  });
  return fromBackend(data);
}

export async function updateClass(classId: string, input: Partial<ClassInput>): Promise<Class> {
  const data = await apiFetch<BackendClass>(`/classes/${encodeURIComponent(classId)}`, {
    method: 'PATCH',
    body: JSON.stringify(toBackendInput(input)),
  });
  return fromBackend(data);
}

export function deleteClass(classId: string): Promise<void> {
  return apiFetch(`/classes/${encodeURIComponent(classId)}`, { method: 'DELETE' });
}

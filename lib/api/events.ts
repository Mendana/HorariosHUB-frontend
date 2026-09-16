import { apiFetch } from './apiFetch';
import type {
  EventItem,
  EventInput,
  EventPatchInput,
  EventsListResponse,
  EventOccurrencesResponse,
} from '../types/events';

export function createEvent(input: EventInput): Promise<EventItem> {
  return apiFetch<EventItem>('/events', { method: 'POST', body: JSON.stringify(input) });
}

export function updateEvent(id: string, input: EventPatchInput): Promise<EventItem> {
  return apiFetch<EventItem>(`/events/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function deleteEvent(id: string): Promise<{ message: string }> {
  return apiFetch(`/events/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export function fetchEvent(id: string): Promise<EventItem> {
  return apiFetch<EventItem>(`/events/${encodeURIComponent(id)}`);
}

export interface FetchEventsParams {
  subject?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export function fetchEvents(params: FetchEventsParams): Promise<EventsListResponse> {
  const qs = new URLSearchParams();
  if (params.subject) qs.set('subject', params.subject);
  if (params.search) qs.set('search', params.search);
  if (params.page) qs.set('page', String(params.page));
  if (params.limit) qs.set('limit', String(params.limit));
  return apiFetch<EventsListResponse>(`/events?${qs.toString()}`);
}

export interface FetchOccurrencesParams {
  from: string;
  to: string;
  subject?: string;
}

export function fetchEventOccurrences(params: FetchOccurrencesParams): Promise<EventOccurrencesResponse> {
  const qs = new URLSearchParams({ from: params.from, to: params.to });
  if (params.subject) qs.set('subject', params.subject);
  return apiFetch<EventOccurrencesResponse>(`/events/occurrences?${qs.toString()}`);
}

import { apiFetch } from './apiFetch';
import type { SubjectCatalogResponse, AutoSelectStatusResponse } from '@/lib/types/subjects';

export function fetchCatalog(): Promise<SubjectCatalogResponse> {
  return apiFetch<SubjectCatalogResponse>('/subjects/catalog');
}

export function fetchAllSubjects(): Promise<{ subjects: string[] }> {
  return apiFetch<{ subjects: string[] }>('/subjects/list');
}

export function fetchGroupsForSubject(code: string): Promise<{ groups: { id: string; name: string }[] }> {
  return apiFetch<{ groups: { id: string; name: string }[] }>(
    `/subjects/${encodeURIComponent(code)}/groups`,
  );
}

export function saveSelection(groups: string[]): Promise<{ message: string; count: number }> {
  return apiFetch('/subjects/selection', {
    method: 'POST',
    body: JSON.stringify({ groups }),
  });
}

export function startAutoSelect(): Promise<{ job_id: string; status: string }> {
  return apiFetch('/subjects/auto-select', { method: 'POST' });
}

export function getAutoSelectStatus(): Promise<AutoSelectStatusResponse> {
  return apiFetch<AutoSelectStatusResponse>('/subjects/auto-select/status');
}

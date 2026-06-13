import { apiFetch } from './apiFetch';
import type { SubjectCatalogResponse, AutoSelectStatusResponse } from '@/lib/types/subjects';

export function fetchCatalog(): Promise<SubjectCatalogResponse> {
  return apiFetch<SubjectCatalogResponse>('/api/subjects/catalog');
}

export function fetchAllSubjects(): Promise<{ subjects: string[] }> {
  return apiFetch<{ subjects: string[] }>('/api/subjects/list');
}

export function fetchGroupsForSubject(code: string): Promise<{ groups: { id: string; name: string }[] }> {
  return apiFetch<{ groups: { id: string; name: string }[] }>(
    `/api/subjects/${encodeURIComponent(code)}/groups`,
  );
}

export function saveSelection(groups: string[]): Promise<{ message: string; count: number }> {
  return apiFetch('/api/subjects/selection', {
    method: 'POST',
    body: JSON.stringify({ groups }),
  });
}

export function startAutoSelect(): Promise<{ job_id: string; status: string }> {
  return apiFetch('/api/subjects/auto-select', { method: 'POST' });
}

export function getAutoSelectStatus(): Promise<AutoSelectStatusResponse> {
  return apiFetch<AutoSelectStatusResponse>('/api/subjects/auto-select/status');
}

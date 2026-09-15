import { apiFetch } from './apiFetch';
import type { UsersImportResult } from '../types/admin';

export function importUsersCsv(file: File): Promise<UsersImportResult> {
  const formData = new FormData();
  formData.append('file', file);
  return apiFetch<UsersImportResult>('/users/import', {
    method: 'POST',
    body: formData,
  });
}

export function triggerScraperSync(): Promise<void> {
  return apiFetch<void>('/scraper/sync', { method: 'POST' });
}

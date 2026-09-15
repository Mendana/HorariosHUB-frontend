import { apiFetch } from './apiFetch';
import type { ScraperSyncResult, ScraperSyncStatus, UsersImportResult } from '../types/admin';

export function importUsersCsv(file: File): Promise<UsersImportResult> {
  const formData = new FormData();
  formData.append('file', file);
  return apiFetch<UsersImportResult>('/users/import', {
    method: 'POST',
    body: formData,
  });
}

export function fetchScraperSyncStatus(): Promise<ScraperSyncStatus> {
  return apiFetch<ScraperSyncStatus>('/scraper/sync/status');
}

// Synchronous, long-running call (up to 30 min) — resolves only once the
// external scraper sync has fully finished (or failed).
export function triggerScraperSync(): Promise<ScraperSyncResult> {
  return apiFetch<ScraperSyncResult>('/scraper/sync', { method: 'POST' });
}

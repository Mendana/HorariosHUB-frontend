export type UsersImportRowStatus = 'created' | 'skipped' | 'error';

export interface UsersImportRow {
  email: string;
  status: UsersImportRowStatus;
  reason: string | null;
}

export interface UsersImportResult {
  total: number;
  created: number;
  skipped: number;
  failed: number;
  details: UsersImportRow[];
}

export type ScraperLockedBy = 'manual-trigger' | 'cronjob';

export interface ScraperSyncStatus {
  syncing: boolean;
  lockedBy: ScraperLockedBy | null;
  lockedSince: string | null;
}

export interface ScraperSyncResult {
  message: string;
  sessionsInserted: number;
  sessionsFromChanges: number;
  changesApplied: number;
  changesIgnored: number;
  overridesExpired: number;
  pendingRejected: number;
  rejectedArchived: number;
}

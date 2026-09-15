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

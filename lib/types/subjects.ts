export interface SubjectGroup {
  id: string;
  name: string;
  selected: boolean;
}

// Matches backend SubjectEntry (no name field — use code for display)
export interface CatalogSubject {
  code: string;
  groups: SubjectGroup[];
}

export interface SubjectCatalogResponse {
  subjects: CatalogSubject[];
}

// Matches backend AutoSelectStatusResponse (snake_case — no rename_all)
export interface AutoSelectStatusResponse {
  job_id: string;
  status: 'processing' | 'completed' | 'failed';
  groups_selected?: number;
  error?: string;
}

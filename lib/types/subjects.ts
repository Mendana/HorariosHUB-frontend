export interface SubjectGroup {
  id: string;
  name: string;
  selected: boolean;
}

export interface CatalogSubject {
  code: string;
  name: string;
  groups: SubjectGroup[];
}

export interface SubjectCatalogResponse {
  subjects: CatalogSubject[];
}

export interface AutoSelectStatus {
  job_id: string;
  status: 'processing' | 'completed' | 'failed';
  groups_selected?: number;
  error?: string;
}

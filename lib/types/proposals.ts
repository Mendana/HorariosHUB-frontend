export type ProposalAction = 'create' | 'modify' | 'delete';
export type ProposalStatus = 'pending' | 'approved' | 'rejected';
export type ProposalStatusFilter = ProposalStatus | 'all';
export type ProposalHistoryStatusFilter = 'approved' | 'rejected' | 'all';

export interface ClassSnapshot {
  subject?: string;
  grp?: string;
  startsAt?: string;  // ISO string
  duration?: number;
  classroom?: string;
}

export interface Proposal {
  id: string;
  action: ProposalAction;
  classId?: string;
  old: ClassSnapshot | null;
  new: ClassSnapshot | null;
  status: ProposalStatus;
  author: string;
  createdAt: string;
  // Only present on GET /proposals/history: date the scraper sync archived this
  // record (session removed or rejection), null while still "live".
  archivedAt?: string | null;
}

export interface ProposalsResponse {
  data: Proposal[];
  total: number;
  page: number;
  limit: number;
}

export interface GetProposalsParams {
  status?: ProposalStatusFilter;
  page?: number;
  limit?: number;
}

export interface GetProposalHistoryParams {
  status?: ProposalHistoryStatusFilter;
  page?: number;
  limit?: number;
}

export type CreateProposalInput =
  | { changeType: 'create'; changes: CreateChanges }
  | { changeType: 'modify'; changes: ModifyChanges }
  | { changeType: 'delete'; changes: DeleteChanges };

export interface CreateChanges {
  subject: string;
  grp: string;
  newStartsAt: string;
  newDuration: number;
  newClassroom: string;
}

export interface ModifyChanges {
  sessionId: string;
  newStartsAt?: string;
  newDuration?: number;
  newClassroom?: string;
}

export interface DeleteChanges {
  sessionId: string;
}

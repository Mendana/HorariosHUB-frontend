export type ProposalAction = 'create' | 'update' | 'delete';
export type ProposalStatus = 'pending' | 'approved' | 'rejected';

export interface ClassSnapshot {
  name?: string;
  type?: string;
  classroom?: string;
  date?: { year: number; month: number; day: number };
  startTime?: string;
  endTime?: string;
  durationMinutes?: number;
}

export interface Proposal {
  id: string;
  action: ProposalAction;
  class_id: string;
  old: ClassSnapshot | null;
  new: ClassSnapshot | null;
  status: ProposalStatus;
  author: string;
  created_at: string;
  reject_reason?: string;
}

export interface ProposalsResponse {
  data: Proposal[];
  total: number;
  page: number;
  limit: number;
}

export interface ChangeRecord {
  id: string;
  classId: string;
  action: ProposalAction;
  changes: {
    old: ClassSnapshot | null;
    new: ClassSnapshot | null;
  };
  approvedBy: string;
  approvedAt: string;
  author: string;
}

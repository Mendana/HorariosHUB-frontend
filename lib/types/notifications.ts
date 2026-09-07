export type NotificationType =
  | 'session_modified'
  | 'session_deleted'
  | 'exam_added'
  | 'proposal_approved'
  | 'proposal_rejected'
  | 'proposal_created'
  | 'scrapper_conflict';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  sessionId: string | null;
  proposalId: string | null;
  read: boolean;
  createdAt: string;
}

export interface PaginatedNotifications {
  data: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface NotificationPreferences {
  inApp: boolean;
  email: boolean;
}

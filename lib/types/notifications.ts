export type NotificationType =
  | 'proposal_approved'
  | 'proposal_rejected'
  | 'proposal_pending'
  | 'class_modified';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string; // ISO 8601
  link?: string;
}

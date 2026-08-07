import { apiFetch } from './apiFetch';
import type { PaginatedNotifications, NotificationPreferences } from '../types/notifications';

interface ListParams {
  read?: boolean;
  page?: number;
  limit?: number;
}

export function fetchNotifications(params?: ListParams): Promise<PaginatedNotifications> {
  const q = new URLSearchParams();
  if (params?.read !== undefined) q.set('read', String(params.read));
  q.set('page', String(params?.page ?? 1));
  q.set('limit', String(params?.limit ?? 20));
  return apiFetch<PaginatedNotifications>(`/notifications?${q}`);
}

export function fetchUnreadCount(): Promise<{ unreadCount: number }> {
  return apiFetch<{ unreadCount: number }>('/notifications/unread-count');
}

export function markNotificationRead(id: string): Promise<{ id: string; read: boolean }> {
  return apiFetch(`/notifications/${id}/read`, { method: 'PATCH' });
}

export function markAllNotificationsRead(): Promise<{ updated: number }> {
  return apiFetch('/notifications/read-all', { method: 'PATCH' });
}

export function deleteNotification(id: string): Promise<{ message: string }> {
  return apiFetch(`/notifications/${id}`, { method: 'DELETE' });
}

export function fetchNotificationPreferences(): Promise<NotificationPreferences> {
  return apiFetch('/users/me/notification-preferences');
}

export function updateNotificationPreferences(
  prefs: Partial<NotificationPreferences>,
): Promise<NotificationPreferences> {
  return apiFetch('/users/me/notification-preferences', {
    method: 'PATCH',
    body: JSON.stringify(prefs),
  });
}

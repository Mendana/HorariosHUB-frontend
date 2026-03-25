'use client';

import { useTranslations } from 'next-intl';
import { NotificationItem } from './NotificationItem';
import type { Notification } from '@/lib/types/notifications';

interface NotificationDropdownProps {
  notifications: Notification[];
  isLoading: boolean;
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onDismiss: (id: string) => void;
  onClose: () => void;
}

export function NotificationDropdown({
  notifications, isLoading, unreadCount,
  onMarkAsRead, onMarkAllAsRead, onDismiss, onClose,
}: NotificationDropdownProps) {
  const t = useTranslations('notifications');

  return (
    <div className="absolute right-0 top-full mt-2 z-50 w-80 bg-surface-raised rounded-md shadow-lg border border-subtle overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-subtle">
        <h2 className="text-sm font-medium text-primary">{t('title')}</h2>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={onMarkAllAsRead}
            className="text-xs text-accent hover:text-accent-hover transition-colors"
          >
            {t('markAllRead')}
          </button>
        )}
      </div>

      {/* Body */}
      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          // Skeleton — 3 items
          Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3 border-b border-subtle last:border-b-0">
              <div className="h-4 w-4 rounded-full bg-surface-sunken animate-pulse shrink-0 mt-0.5" />
              <div className="flex-1 flex flex-col gap-1.5">
                <div className="h-4 w-3/4 rounded-sm bg-surface-sunken animate-pulse" />
                <div className="h-3 w-full rounded-sm bg-surface-sunken animate-pulse" />
                <div className="h-3 w-1/4 rounded-sm bg-surface-sunken animate-pulse" />
              </div>
            </div>
          ))
        ) : notifications.length === 0 ? (
          <p className="py-8 text-center text-sm text-secondary">{t('empty')}</p>
        ) : (
          notifications.map((n) => (
            <NotificationItem
              key={n.id}
              notification={n}
              onMarkAsRead={onMarkAsRead}
              onDismiss={onDismiss}
              onClose={onClose}
            />
          ))
        )}
      </div>
    </div>
  );
}

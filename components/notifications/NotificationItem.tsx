'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  CalendarX,
  BookOpen,
  AlertTriangle,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Notification, NotificationType } from '@/lib/types/notifications';

const DURATION_MS = 250;

interface TypeConfig {
  Icon: LucideIcon;
  iconClass: string;
}

const TYPE_CONFIG: Record<NotificationType, TypeConfig> = {
  session_modified:  { Icon: Calendar,       iconClass: 'text-accent' },
  session_deleted:   { Icon: CalendarX,      iconClass: 'text-error' },
  exam_added:        { Icon: BookOpen,       iconClass: 'text-warning' },
  proposal_approved: { Icon: CheckCircle,    iconClass: 'text-success' },
  proposal_rejected: { Icon: XCircle,        iconClass: 'text-error' },
  new_proposal:      { Icon: Clock,          iconClass: 'text-warning' },
  scraper_conflict:  { Icon: AlertTriangle,  iconClass: 'text-warning' },
};

function linkForNotification(n: Notification): string | undefined {
  if (n.proposalId) return '/proposals';
  return undefined;
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDismiss: (id: string) => void;
  onClose: () => void;
}

export function NotificationItem({
  notification, onMarkAsRead, onDismiss, onClose,
}: NotificationItemProps) {
  const t = useTranslations('notifications');
  const router = useRouter();
  const { Icon, iconClass } = TYPE_CONFIG[notification.type];
  const link = linkForNotification(notification);

  function relativeDate(): string {
    const diff = Date.now() - new Date(notification.createdAt).getTime();
    const minutes = Math.floor(diff / 60_000);
    const hours = Math.floor(diff / 3_600_000);
    const days = Math.floor(diff / 86_400_000);
    if (minutes < 1) return t('relativeNow');
    if (minutes < 60) return t('relativeMinutes', { n: minutes });
    if (hours < 24) return t('relativeHours', { h: hours });
    if (days === 1) return t('relativeYesterday');
    return t('relativeDays', { d: days });
  }

  function handleClick() {
    if (!notification.read) onMarkAsRead(notification.id);
    if (link) {
      onClose();
      setTimeout(() => router.push(link), DURATION_MS);
    }
  }

  function handleDismiss(e: React.MouseEvent) {
    e.stopPropagation();
    onDismiss(notification.id);
  }

  const itemCls = [
    'group relative flex items-start gap-3 px-4 py-3 border-b border-subtle last:border-b-0',
    'transition-[background-color,filter] transition-base',
    notification.read ? '' : 'bg-accent-subtle',
    link
      ? [
          'cursor-pointer active:brightness-[0.96]',
          notification.read
            ? 'hover:bg-surface-sunken'
            : 'hover:brightness-[0.97]',
        ].join(' ')
      : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      role={link ? 'button' : undefined}
      tabIndex={link ? 0 : undefined}
      aria-label={link ? notification.title : undefined}
      className={itemCls}
      onClick={link ? handleClick : undefined}
      onKeyDown={link ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); }
      } : undefined}
    >
      <div className="shrink-0 mt-0.5">
        <Icon size={16} className={iconClass} aria-hidden />
      </div>

      <div className="flex-1 min-w-0 pr-4">
        <p className={`text-sm ${notification.read ? 'text-primary' : 'font-medium text-primary'}`}>
          {notification.title}
        </p>
        <p className="text-xs text-secondary mt-0.5">{notification.body}</p>
        <p className="text-xs text-tertiary mt-1">{relativeDate()}</p>
      </div>

      <button
        type="button"
        onClick={handleDismiss}
        aria-label={t('dismiss')}
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 p-1 rounded-sm text-tertiary hover:text-primary hover:bg-surface-raised transition-opacity transition-fast"
      >
        <X size={12} aria-hidden />
      </button>
    </div>
  );
}

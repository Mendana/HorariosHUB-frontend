'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { NotificationDropdown } from './NotificationDropdown';

export function NotificationBell() {
  const t = useTranslations('topbar');
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead, dismiss } =
    useNotifications();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={t('notifications')}
        aria-expanded={open}
        className="relative p-2 rounded-sm text-secondary hover:text-primary hover:bg-surface-raised transition-colors"
      >
        <Bell size={18} aria-hidden />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[1rem] h-4 flex items-center justify-center rounded-full bg-error text-white text-[10px] font-medium leading-none px-0.5 pointer-events-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <NotificationDropdown
          notifications={notifications}
          isLoading={isLoading}
          unreadCount={unreadCount}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onDismiss={dismiss}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}

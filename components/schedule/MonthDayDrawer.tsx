'use client';

import { useEffect, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { X } from 'lucide-react';
import type { Subject } from '@/lib/types/schedule';

interface MonthDayDrawerProps {
  date: Date | null;
  subjects: Subject[];
  onClose: () => void;
}

export function MonthDayDrawer({ date, subjects, onClose }: MonthDayDrawerProps) {
  const t = useTranslations('schedule');
  const locale = useLocale();
  const touchStartYRef = useRef<number | null>(null);

  useEffect(() => {
    if (!date) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [date, onClose]);

  useEffect(() => {
    if (date) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [date]);

  if (!date) return null;

  const dayLabel = new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(date);

  const sorted = [...subjects].sort((a, b) => {
    const [ah, am] = a.startTime.split(':').map(Number);
    const [bh, bm] = b.startTime.split(':').map(Number);
    return ah * 60 + am - (bh * 60 + bm);
  });

  function handleTouchStart(e: React.TouchEvent) {
    touchStartYRef.current = e.touches[0].clientY;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartYRef.current === null) return;
    const delta = e.changedTouches[0].clientY - touchStartYRef.current;
    if (delta > 60) onClose();
    touchStartYRef.current = null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" aria-hidden />

      {/* Sheet */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative z-10 bg-surface-raised rounded-t-md shadow-md max-h-[70vh] flex flex-col"
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-border-subtle" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-subtle shrink-0">
          <h2 className="text-sm font-medium text-primary capitalize">{dayLabel}</h2>
          <button
            onClick={onClose}
            aria-label={t('closeDrawer')}
            className="size-8 flex items-center justify-center rounded-sm text-secondary hover:text-primary hover:bg-surface-sunken transition-colors transition-fast active:scale-[0.95]"
          >
            <X size={16} />
          </button>
        </div>

        {/* Subject list */}
        <div className="overflow-y-auto px-4 py-3 flex flex-col gap-0">
          {sorted.length === 0 ? (
            <p className="text-sm text-secondary text-center py-4">{t('emptyWeek')}</p>
          ) : (
            sorted.map((s) => (
              <div
                key={s.id}
                className="flex items-start gap-3 py-2.5 border-b border-subtle last:border-0"
              >
                <span className="text-xs text-tertiary tabular-nums pt-0.5 w-10 shrink-0">
                  {s.startTime}
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium text-primary truncate">{s.name}</span>
                  {s.classroom && (
                    <span className="text-xs text-secondary">{s.classroom}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { History } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { useClassHistory } from '@/lib/hooks/useClassHistory';
import { HistoryItem } from './HistoryItem';

interface HistoryTabProps {
  classId: string;
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function HistorySkeleton() {
  return (
    <div className="space-y-3 pt-1" aria-hidden>
      {[80, 60, 70].map((w) => (
        <div key={w} className="py-2.5 border-b border-subtle last:border-0 space-y-1.5">
          <div className="flex gap-2">
            <div className="h-2.5 rounded-sm bg-surface-sunken animate-pulse w-4" />
            <div className="h-2.5 rounded-sm bg-surface-sunken animate-pulse w-16" />
            <div className="h-2.5 rounded-sm bg-surface-sunken animate-pulse ml-auto w-12" />
          </div>
          <div className="h-2 rounded-sm bg-surface-sunken animate-pulse w-32" />
          <div className={`h-2 rounded-sm bg-surface-sunken animate-pulse`} style={{ width: `${w}%` }} />
        </div>
      ))}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────────────────

export function HistoryTab({ classId }: HistoryTabProps) {
  const t = useTranslations('history');
  const locale = useLocale();
  const { history, isLoading } = useClassHistory(classId);

  if (isLoading) return <HistorySkeleton />;

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
        <History size={22} className="text-tertiary" aria-hidden />
        <p className="text-xs text-tertiary">{t('empty')}</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto max-h-56">
      {history.map((record) => (
        <HistoryItem key={record.id} record={record} locale={locale} />
      ))}
    </div>
  );
}

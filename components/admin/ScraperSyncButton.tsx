'use client';

import { RefreshCw } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { useScraperSync } from '@/lib/hooks/useScraperSync';
import type { ScraperSyncResult } from '@/lib/types/admin';

const STAT_KEYS: (keyof Omit<ScraperSyncResult, 'message'>)[] = [
  'sessionsInserted',
  'sessionsFromChanges',
  'changesApplied',
  'changesIgnored',
  'overridesExpired',
  'pendingRejected',
  'rejectedArchived',
];

export function ScraperSyncButton() {
  const t = useTranslations('adminTools');
  const locale = useLocale();
  const { status, isStatusLoading, triggerState, result, errorMessage, trigger } = useScraperSync();

  const isLocked = status?.syncing === true;
  const isBusy = isLocked || triggerState === 'triggering';
  const isDisabled = isStatusLoading || isBusy;

  function formatTime(iso: string) {
    return new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={trigger}
        disabled={isDisabled}
        loading={isBusy}
        iconLeft={!isBusy ? RefreshCw : undefined}
      >
        {t('syncButton')}
      </Button>

      {isStatusLoading && (
        <p className="text-xs text-secondary">{t('syncCheckingStatus')}</p>
      )}

      {!isStatusLoading && isLocked && status && (
        <p className="text-xs text-secondary">
          {t('syncLockedTitle')}
          {status.lockedBy && ` · ${status.lockedBy === 'cronjob' ? t('syncLockedByCronjob') : t('syncLockedByManual')}`}
          {status.lockedSince && ` · ${t('syncLockedSince', { time: formatTime(status.lockedSince) })}`}
        </p>
      )}

      {!isStatusLoading && !isLocked && triggerState === 'triggering' && (
        <p className="text-xs text-secondary">{t('syncRunning')}</p>
      )}

      {triggerState === 'conflict' && (
        <p className="text-xs text-secondary max-w-sm">{t('syncConflict')}</p>
      )}

      {triggerState === 'success' && result && (
        <div className="max-w-md">
          <p className="text-xs text-success">{result.message}</p>
          <dl className="mt-1.5 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1">
            {STAT_KEYS.map((key) => (
              <div key={key} className="flex flex-col">
                <dt className="text-[11px] text-tertiary">{t(`stat_${key}`)}</dt>
                <dd className="text-xs text-primary font-medium tabular-nums">{result[key]}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {triggerState === 'error' && (
        <div className="flex items-center gap-3">
          <p className="text-xs text-error">{errorMessage || t('syncError')}</p>
          <button type="button" onClick={trigger} className="shrink-0 text-xs font-medium text-error hover:underline">
            {t('retry')}
          </button>
        </div>
      )}
    </div>
  );
}

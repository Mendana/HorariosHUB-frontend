'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { triggerScraperSync } from '@/lib/api/admin';
import { getErrorMessage } from '@/lib/errors';

type State = 'idle' | 'running' | 'success' | 'error';

export function ScraperSyncButton() {
  const t = useTranslations('adminTools');
  const [state, setState] = useState<State>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleClick() {
    setState('running');
    setErrorMsg('');
    try {
      await triggerScraperSync();
      setState('success');
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
      setState('error');
    }
  }

  return (
    <div className="flex flex-col items-start gap-1.5">
      <Button
        variant="secondary"
        size="sm"
        onClick={handleClick}
        loading={state === 'running'}
        iconLeft={state !== 'running' ? RefreshCw : undefined}
      >
        {t('syncButton')}
      </Button>

      {state === 'running' && (
        <p className="text-xs text-secondary">{t('syncRunning')}</p>
      )}
      {state === 'success' && (
        <p className="text-xs text-success">{t('syncSuccess')}</p>
      )}
      {state === 'error' && (
        <p className="text-xs text-error">{errorMsg || t('syncError')}</p>
      )}
    </div>
  );
}

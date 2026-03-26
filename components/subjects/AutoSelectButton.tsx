'use client';

import { useState } from 'react';
import { Wand2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import type { AutoSelectResult } from '@/lib/hooks/useSubjects';

interface AutoSelectButtonProps {
  onAutoSelect: () => Promise<AutoSelectResult>;
  onComplete: (groupIds: string[]) => void;
}

type State = 'idle' | 'running' | 'success' | 'error';

export function AutoSelectButton({ onAutoSelect, onComplete }: AutoSelectButtonProps) {
  const t = useTranslations('mySubjects');
  const [state, setState] = useState<State>('idle');
  const [successCount, setSuccessCount] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  async function handleClick() {
    setState('running');
    setErrorMsg('');
    try {
      const result = await onAutoSelect();
      setSuccessCount(result.groups_selected);
      onComplete(result.selected_group_ids);
      setState('success');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t('autoSelectError'));
      setState('error');
    }
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <Button
        variant="secondary"
        size="sm"
        onClick={handleClick}
        loading={state === 'running'}
        iconLeft={state !== 'running' ? Wand2 : undefined}
      >
        {t('autoSelect')}
      </Button>

      {state === 'running' && (
        <p className="text-xs text-secondary text-right max-w-56">
          {t('autoSelectRunning')}
        </p>
      )}
      {state === 'success' && (
        <p className="text-xs text-success text-right">
          {t('autoSelectSuccess', { count: successCount })}
        </p>
      )}
      {state === 'error' && (
        <p className="text-xs text-error text-right">
          {errorMsg || t('autoSelectError')}
        </p>
      )}
    </div>
  );
}

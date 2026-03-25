'use client';

import { useState } from 'react';
import { Wand2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Spinner } from '@/components/ui/Spinner';
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
      <button
        onClick={handleClick}
        disabled={state === 'running'}
        className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-subtle rounded-sm text-secondary hover:text-primary hover:border-strong transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {state === 'running' ? <Spinner size={14} /> : <Wand2 size={14} aria-hidden />}
        {t('autoSelect')}
      </button>

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

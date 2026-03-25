'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Spinner } from '@/components/ui/Spinner';

interface ProposalActionsProps {
  proposalId: string;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason?: string) => Promise<void>;
}

type ActionState = 'idle' | 'approving' | 'rejecting' | 'confirming-reject';

export function ProposalActions({ proposalId, onApprove, onReject }: ProposalActionsProps) {
  const t = useTranslations('proposals');
  const [state, setState] = useState<ActionState>('idle');
  const [reason, setReason] = useState('');

  async function handleApprove() {
    setState('approving');
    try {
      await onApprove(proposalId);
    } finally {
      setState('idle');
    }
  }

  async function handleConfirmReject() {
    setState('rejecting');
    try {
      await onReject(proposalId, reason.trim() || undefined);
    } finally {
      setState('idle');
      setReason('');
    }
  }

  const isBusy = state === 'approving' || state === 'rejecting';

  if (state === 'confirming-reject' || state === 'rejecting') {
    return (
      <div className="flex flex-col gap-1.5 items-end">
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder={t('rejectReasonPlaceholder')}
          disabled={state === 'rejecting'}
          className="h-8 w-full max-w-56 px-2 rounded-sm bg-surface-sunken border border-subtle text-sm text-primary placeholder:text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50"
        />
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setState('idle'); setReason(''); }}
            disabled={isBusy}
            className="px-2.5 py-1 text-xs border border-subtle rounded-sm text-secondary hover:text-primary hover:border-strong transition-colors disabled:opacity-50"
          >
            {t('cancelReject')}
          </button>
          <button
            onClick={handleConfirmReject}
            disabled={isBusy}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-error text-white rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {state === 'rejecting' && <Spinner size={12} />}
            {t('confirmReject')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setState('confirming-reject')}
        disabled={isBusy}
        className="px-2.5 py-1 text-xs border border-error rounded-sm text-error hover:bg-error-subtle transition-colors disabled:opacity-50"
      >
        {t('reject')}
      </button>
      <button
        onClick={handleApprove}
        disabled={isBusy}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs bg-success text-white rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {state === 'approving' && <Spinner size={12} />}
        {t('approve')}
      </button>
    </div>
  );
}

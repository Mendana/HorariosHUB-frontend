'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check, X } from 'lucide-react';
import { Spinner } from '@/components/ui/Spinner';
import { INPUT_FIELD_CLS } from '@/components/ui/Input';

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
    try { await onApprove(proposalId); }
    finally { setState('idle'); }
  }

  async function handleConfirmReject() {
    setState('rejecting');
    try { await onReject(proposalId, reason.trim() || undefined); }
    finally { setState('idle'); setReason(''); }
  }

  const isBusy = state === 'approving' || state === 'rejecting';

  /* ── Reject confirmation form ────────────────────────────────────────────── */
  if (state === 'confirming-reject' || state === 'rejecting') {
    return (
      <div className="flex flex-col gap-2 p-2.5 rounded-sm bg-error-subtle/60 border border-error/20 animate-block-in">
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleConfirmReject(); }}
          placeholder={t('rejectReasonPlaceholder')}
          disabled={state === 'rejecting'}
           
          autoFocus
          className={`${INPUT_FIELD_CLS} h-7 px-2 text-xs`}
        />
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => { setState('idle'); setReason(''); }}
            disabled={isBusy}
            className="h-7 px-2.5 text-xs border border-subtle rounded-sm text-secondary hover:text-primary hover:border-strong transition-colors disabled:opacity-50"
          >
            {t('cancelReject')}
          </button>
          <button
            type="button"
            onClick={handleConfirmReject}
            disabled={isBusy}
            className="h-7 inline-flex items-center gap-1 px-2.5 text-xs bg-error text-white rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {state === 'rejecting' ? <Spinner size={11} /> : <X size={11} aria-hidden />}
            {t('confirmReject')}
          </button>
        </div>
      </div>
    );
  }

  /* ── Idle buttons ────────────────────────────────────────────────────────── */
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => setState('confirming-reject')}
        disabled={isBusy}
        className="h-7 inline-flex items-center gap-1 px-2.5 text-xs border border-error/40 rounded-sm text-error hover:bg-error-subtle hover:border-error transition-colors disabled:opacity-50"
      >
        <X size={11} aria-hidden />
        {t('reject')}
      </button>
      <button
        type="button"
        onClick={handleApprove}
        disabled={isBusy}
        className="h-7 inline-flex items-center gap-1 px-2.5 text-xs bg-success text-white rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {state === 'approving' ? <Spinner size={11} /> : <Check size={11} aria-hidden />}
        {t('approve')}
      </button>
    </div>
  );
}

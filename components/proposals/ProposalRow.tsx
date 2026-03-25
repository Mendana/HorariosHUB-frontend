'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Proposal, ProposalAction, ProposalStatus } from '@/lib/types/proposals';
import { ProposalDiff } from './ProposalDiff';
import { ProposalActions } from './ProposalActions';

interface ProposalRowProps {
  proposal: Proposal;
  showActions: boolean;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason?: string) => Promise<void>;
}

const ACTION_CLASSES: Record<ProposalAction, string> = {
  create: 'bg-success-subtle text-success border border-success',
  update: 'bg-warning-subtle text-warning border border-warning',
  delete: 'bg-error-subtle text-error border border-error',
};

const STATUS_CLASSES: Record<ProposalStatus, string> = {
  pending: 'bg-warning-subtle text-warning border border-warning',
  approved: 'bg-success-subtle text-success border border-success',
  rejected: 'bg-error-subtle text-error border border-error',
};

function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'hoy';
  if (days === 1) return 'ayer';
  if (days < 7) return `hace ${days} días`;
  return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function subjectLabel(proposal: Proposal): string {
  const snap = proposal.new ?? proposal.old;
  return snap?.name ?? proposal.class_id;
}

export function ProposalRow({ proposal, showActions, onApprove, onReject }: ProposalRowProps) {
  const t = useTranslations('proposals');
  const [expanded, setExpanded] = useState(false);

  const actionLabelKey = `action${proposal.action.charAt(0).toUpperCase() + proposal.action.slice(1)}` as const;
  const statusLabelKey = `status${proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}` as const;

  return (
    <>
      <tr className="border-b border-subtle hover:bg-surface-raised transition-colors">
        <td className="py-3 px-3">
          <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-sm ${ACTION_CLASSES[proposal.action]}`}>
            {t(actionLabelKey)}
          </span>
        </td>
        <td className="py-3 px-3 text-sm text-primary">{subjectLabel(proposal)}</td>
        <td className="py-3 px-3 text-sm text-secondary">{proposal.author}</td>
        <td className="py-3 px-3 text-sm text-secondary" title={new Date(proposal.created_at).toLocaleString('es-ES')}>
          {relativeDate(proposal.created_at)}
        </td>
        <td className="py-3 px-3">
          <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-sm ${STATUS_CLASSES[proposal.status]}`}>
            {t(statusLabelKey)}
          </span>
        </td>
        <td className="py-3 px-3">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setExpanded((e) => !e)}
              className="text-xs text-accent hover:underline"
            >
              {expanded ? t('hideDetail') : t('viewDetail')}
            </button>
            {showActions && proposal.status === 'pending' && (
              <ProposalActions
                proposalId={proposal.id}
                onApprove={onApprove}
                onReject={onReject}
              />
            )}
          </div>
        </td>
      </tr>
      {expanded && (
        <tr className="border-b border-subtle">
          <td colSpan={6} className="px-3 pb-3">
            <ProposalDiff proposal={proposal} />
            {proposal.status === 'rejected' && proposal.reject_reason && (
              <p className="mt-2 text-xs text-error">
                {t('rejectReasonLabel')}: {proposal.reject_reason}
              </p>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

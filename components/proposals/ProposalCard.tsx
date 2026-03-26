'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Proposal, ProposalAction, ProposalStatus } from '@/lib/types/proposals';
import { ProposalDiff } from './ProposalDiff';
import { ProposalActions } from './ProposalActions';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';

interface ProposalCardProps {
  proposal: Proposal;
  showActions: boolean;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason?: string) => Promise<void>;
}

const ACTION_VARIANT: Record<ProposalAction, BadgeVariant> = {
  create: 'success',
  update: 'warning',
  delete: 'error',
};

const STATUS_VARIANT: Record<ProposalStatus, BadgeVariant> = {
  pending:  'warning',
  approved: 'success',
  rejected: 'error',
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

export function ProposalCard({ proposal, showActions, onApprove, onReject }: ProposalCardProps) {
  const t = useTranslations('proposals');
  const [expanded, setExpanded] = useState(false);

  const actionLabelKey = `action${proposal.action.charAt(0).toUpperCase() + proposal.action.slice(1)}` as const;
  const statusLabelKey = `status${proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}` as const;

  return (
    <div className="rounded-sm border border-subtle bg-surface-raised p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <Badge variant={ACTION_VARIANT[proposal.action]} size="sm">{t(actionLabelKey)}</Badge>
        <Badge variant={STATUS_VARIANT[proposal.status]} size="sm">{t(statusLabelKey)}</Badge>
      </div>

      <p className="text-sm font-medium text-primary">{subjectLabel(proposal)}</p>

      <div className="flex items-center justify-between text-xs text-secondary gap-2">
        <span>{proposal.author}</span>
        <span title={new Date(proposal.created_at).toLocaleString('es-ES')}>
          {relativeDate(proposal.created_at)}
        </span>
      </div>

      <div className="flex items-center gap-3 flex-wrap pt-1">
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

      {expanded && (
        <div>
          <ProposalDiff proposal={proposal} />
          {proposal.status === 'rejected' && proposal.reject_reason && (
            <p className="mt-2 text-xs text-error">
              {t('rejectReasonLabel')}: {proposal.reject_reason}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

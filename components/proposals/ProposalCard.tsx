'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown } from 'lucide-react';
import type { Proposal, ProposalAction, ProposalStatus } from '@/lib/types/proposals';
import { ProposalDiff } from './ProposalDiff';
import { ProposalActions } from './ProposalActions';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';

interface ProposalCardProps {
  proposal: Proposal;
  showActions: boolean;
  index?: number;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason?: string) => Promise<void>;
}

const ACTION_VARIANT: Record<ProposalAction, BadgeVariant> = {
  create: 'success',
  modify: 'warning',
  delete: 'error',
};

const STATUS_VARIANT: Record<ProposalStatus, BadgeVariant> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
};

const ACTION_BAR_COLOR: Record<ProposalAction, string> = {
  create: 'var(--color-success)',
  modify: 'var(--color-warning)',
  delete: 'var(--color-error)',
};

function relativeDate(
  iso: string,
  t: (key: string, values?: Record<string, string | number | Date>) => string,
): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return t('relativeDateToday');
  if (days === 1) return t('relativeDateYesterday');
  if (days < 7) return t('relativeDateDaysAgo', { days });
  return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function subjectLabel(proposal: Proposal): string {
  const snap = proposal.new ?? proposal.old;
  return snap?.subject ?? proposal.classId ?? proposal.id;
}

export function ProposalCard({
  proposal,
  showActions,
  index = 0,
  onApprove,
  onReject,
}: ProposalCardProps) {
  const t = useTranslations('proposals');
  const [expanded, setExpanded] = useState(false);

  const actionLabelKey = `action${proposal.action.charAt(0).toUpperCase() + proposal.action.slice(1)}` as const;
  const statusLabelKey = `status${proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}` as const;
  const barColor = ACTION_BAR_COLOR[proposal.action];

  return (
    <div
      className="relative rounded-md border border-subtle bg-surface-raised overflow-hidden animate-block-in"
      style={{ animationDelay: `${Math.min(index * 40, 300)}ms` }}
    >
      {/* Left action-type bar */}
      <span
        className="absolute left-0 inset-y-0 w-[3px] shrink-0"
        style={{ backgroundColor: barColor }}
        aria-hidden
      />

      {/* Card header */}
      <div className="pl-4 pr-3 pt-3 pb-2">
        {/* Badges row */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <Badge variant={ACTION_VARIANT[proposal.action]} size="sm">
            {t(actionLabelKey)}
          </Badge>
          <Badge variant={STATUS_VARIANT[proposal.status]} size="sm">
            {t(statusLabelKey)}
          </Badge>
        </div>

        {/* Subject / class identifier */}
        <p className="text-sm font-medium text-primary leading-snug mb-1">
          {subjectLabel(proposal)}
        </p>

        {/* Meta */}
        <p className="text-xs text-secondary">
          <span className="font-mono">{proposal.author}</span>
          <span className="mx-1.5 text-tertiary" aria-hidden>·</span>
          <span title={new Date(proposal.createdAt).toLocaleString('es-ES')}>
            {relativeDate(proposal.createdAt, t)}
          </span>
        </p>

        {/* Expand toggle */}
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="mt-2.5 flex items-center gap-1 text-xs text-accent hover:opacity-80 transition-opacity"
        >
          <ChevronDown
            size={13}
            className={[
              'transition-transform duration-200',
              expanded ? 'rotate-180' : '',
            ].join(' ')}
            aria-hidden
          />
          {expanded ? t('hideDetail') : t('viewDetail')}
        </button>
      </div>

      {/* Expandable area — CSS grid accordion */}
      <div
        style={{
          display: 'grid',
          gridTemplateRows: expanded ? '1fr' : '0fr',
          transition: 'grid-template-rows 200ms ease',
        }}
      >
        <div className="overflow-hidden">
          <div className="pl-4 pr-3 pb-3 border-t border-subtle/60">
            <ProposalDiff proposal={proposal} />

            {showActions && proposal.status === 'pending' && (
              <div className="mt-3 flex justify-end">
                <ProposalActions
                  proposalId={proposal.id}
                  onApprove={onApprove}
                  onReject={onReject}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

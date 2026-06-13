'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown } from 'lucide-react';
import type { Proposal, ProposalAction, ProposalStatus } from '@/lib/types/proposals';
import { ProposalDiff } from './ProposalDiff';
import { ProposalActions } from './ProposalActions';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';

interface ProposalRowProps {
  proposal: Proposal;
  showActions: boolean;
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

export function ProposalRow({ proposal, showActions, onApprove, onReject }: ProposalRowProps) {
  const t = useTranslations('proposals');
  const [expanded, setExpanded] = useState(false);

  const actionLabelKey = `action${proposal.action.charAt(0).toUpperCase() + proposal.action.slice(1)}` as const;
  const statusLabelKey = `status${proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}` as const;
  const barColor = ACTION_BAR_COLOR[proposal.action];

  return (
    <>
      {/* Main data row — box-shadow trick for left color bar (no extra column) */}
      <tr
        className="border-b border-subtle hover:bg-surface-raised/50 transition-colors cursor-pointer"
        style={{
          boxShadow: `inset 3px 0 0 ${barColor}`,
        }}
        onClick={() => setExpanded((e) => !e)}
      >
        <td className="py-3 pl-4 pr-3">
          <Badge variant={ACTION_VARIANT[proposal.action]} size="sm">{t(actionLabelKey)}</Badge>
        </td>
        <td className="py-3 px-3 text-sm text-primary font-medium">
          {subjectLabel(proposal)}
        </td>
        <td className="py-3 px-3 text-xs text-secondary font-mono">
          {proposal.author}
        </td>
        <td
          className="py-3 px-3 text-xs text-secondary tabular-nums"
          title={new Date(proposal.createdAt).toLocaleString('es-ES')}
        >
          {relativeDate(proposal.createdAt, t)}
        </td>
        <td className="py-3 px-3">
          <Badge variant={STATUS_VARIANT[proposal.status]} size="sm">{t(statusLabelKey)}</Badge>
        </td>
        <td className="py-3 pl-3 pr-4">
          {/* Stop propagation so clicking the chevron itself still works */}
          <div className="flex items-center justify-end" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setExpanded((e) => !e)}
              aria-label={expanded ? t('hideDetail') : t('viewDetail')}
              aria-expanded={expanded}
              className="size-6 flex items-center justify-center rounded-sm text-tertiary hover:text-primary hover:bg-surface-sunken transition-colors"
            >
              <ChevronDown
                size={14}
                className={[
                  'transition-transform duration-200',
                  expanded ? 'rotate-180' : '',
                ].join(' ')}
                aria-hidden
              />
            </button>
          </div>
        </td>
      </tr>

      {/* Expansion row — always rendered, animated via CSS grid trick */}
      <tr className="border-b border-subtle">
        <td colSpan={6} className="p-0">
          <div
            style={{
              display: 'grid',
              gridTemplateRows: expanded ? '1fr' : '0fr',
              transition: 'grid-template-rows 200ms ease',
            }}
          >
            <div className="overflow-hidden">
              <div className="px-4 py-3 bg-surface-sunken/30">
                <ProposalDiff proposal={proposal} />

                {showActions && proposal.status === 'pending' && (
                  <div className="mt-3 flex justify-end" onClick={(e) => e.stopPropagation()}>
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
        </td>
      </tr>
    </>
  );
}

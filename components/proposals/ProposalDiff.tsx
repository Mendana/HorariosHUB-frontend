'use client';

import { Fragment } from 'react';
import { ArrowRight, Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Proposal, ClassSnapshot } from '@/lib/types/proposals';

interface ProposalDiffProps {
  proposal: Proposal;
}

type FieldKey = keyof ClassSnapshot;

const FIELDS: { key: FieldKey; labelKey: string }[] = [
  { key: 'subject', labelKey: 'diffFieldName' },
  { key: 'grp', labelKey: 'diffFieldGrp' },
  { key: 'startsAt', labelKey: 'diffFieldStartTime' },
  { key: 'duration', labelKey: 'diffFieldDuration' },
  { key: 'classroom', labelKey: 'diffFieldClassroom' },
];

function formatValue(key: FieldKey, value: ClassSnapshot[FieldKey]): string {
  if (value === undefined || value === null) return '—';
  if (key === 'startsAt' && typeof value === 'string') {
    const d = new Date(value);
    return `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${d.getUTCFullYear()} ${String(d.getUTCHours()).padStart(2, '0')}:${String(d.getUTCMinutes()).padStart(2, '0')}`;
  }
  if (key === 'duration' && typeof value === 'number') {
    const h = Math.floor(value / 60);
    const m = value % 60;
    return h > 0 ? (m > 0 ? `${h}h ${m}min` : `${h}h`) : `${m}min`;
  }
  return String(value);
}

export function ProposalDiff({ proposal }: ProposalDiffProps) {
  const t = useTranslations('proposals');
  const { action, old: oldSnap, new: newSnap } = proposal;

  /* ── Create ─────────────────────────────────────────────────────────────── */
  if (action === 'create' && newSnap) {
    const fields = FIELDS.filter(({ key }) => newSnap[key] !== undefined);
    return (
      <div className="mt-2 rounded-sm border border-success/25 bg-success-subtle/40 px-3 py-2.5">
        <div className="flex items-center gap-1.5 mb-2.5">
          <Plus size={11} className="text-success shrink-0" aria-hidden />
          <span className="text-[11px] font-medium text-success uppercase tracking-[0.06em]">
            {t('actionCreate')}
          </span>
        </div>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
          {fields.map(({ key, labelKey }) => (
            <Fragment key={key}>
              <dt className="text-xs text-tertiary whitespace-nowrap">{t(labelKey)}</dt>
              <dd className="text-xs text-primary font-medium">{formatValue(key, newSnap[key])}</dd>
            </Fragment>
          ))}
        </dl>
      </div>
    );
  }

  /* ── Delete ─────────────────────────────────────────────────────────────── */
  if (action === 'delete' && oldSnap) {
    const fields = FIELDS.filter(({ key }) => oldSnap[key] !== undefined);
    return (
      <div className="mt-2 rounded-sm border border-error/25 bg-error-subtle/40 px-3 py-2.5">
        <div className="flex items-center gap-1.5 mb-2.5">
          <Trash2 size={11} className="text-error shrink-0" aria-hidden />
          <span className="text-[11px] font-medium text-error uppercase tracking-[0.06em]">
            {t('actionDelete')}
          </span>
        </div>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
          {fields.map(({ key, labelKey }) => (
            <Fragment key={key}>
              <dt className="text-xs text-tertiary whitespace-nowrap">{t(labelKey)}</dt>
              <dd className="text-xs text-error/70 line-through">{formatValue(key, oldSnap[key])}</dd>
            </Fragment>
          ))}
        </dl>
      </div>
    );
  }

  /* ── Update ─────────────────────────────────────────────────────────────── */
  if (action === 'modify' && oldSnap && newSnap) {
    const changedFields = FIELDS.filter(
      ({ key }) => oldSnap[key] !== undefined || newSnap[key] !== undefined,
    );
    return (
      <div className="mt-2 rounded-sm border border-warning/25 bg-warning-subtle/40 px-3 py-2.5">
        {/* Column header row */}
        <div className="grid grid-cols-[auto_1fr_16px_1fr] gap-x-3 mb-2">
          <span />
          <span className="text-[11px] font-medium text-tertiary uppercase tracking-[0.06em]">
            {t('diffOldLabel')}
          </span>
          <span />
          <span className="text-[11px] font-medium text-tertiary uppercase tracking-[0.06em]">
            {t('diffNewLabel')}
          </span>
        </div>
        <dl className="grid grid-cols-[auto_1fr_16px_1fr] items-baseline gap-x-3 gap-y-1.5">
          {changedFields.map(({ key, labelKey }) => (
            <Fragment key={key}>
              <dt className="text-xs text-tertiary whitespace-nowrap">{t(labelKey)}</dt>
              <dd className="text-xs text-secondary line-through decoration-error/40">
                {formatValue(key, oldSnap[key])}
              </dd>
              <ArrowRight
                size={11}
                className="text-tertiary self-center justify-self-center"
                aria-hidden
              />
              <dd className="text-xs text-primary font-medium">
                {formatValue(key, newSnap[key])}
              </dd>
            </Fragment>
          ))}
        </dl>
      </div>
    );
  }

  return null;
}

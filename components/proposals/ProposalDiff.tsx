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
  { key: 'name',            labelKey: 'diffFieldName' },
  { key: 'type',            labelKey: 'diffFieldType' },
  { key: 'classroom',       labelKey: 'diffFieldClassroom' },
  { key: 'date',            labelKey: 'diffFieldDate' },
  { key: 'startTime',       labelKey: 'diffFieldStartTime' },
  { key: 'endTime',         labelKey: 'diffFieldEndTime' },
  { key: 'durationMinutes', labelKey: 'diffFieldDuration' },
];

function formatValue(key: FieldKey, value: ClassSnapshot[FieldKey]): string {
  if (value === undefined || value === null) return '—';
  if (key === 'date' && typeof value === 'object' && 'year' in value) {
    const d = value as { year: number; month: number; day: number };
    return `${String(d.day).padStart(2, '0')}/${String(d.month).padStart(2, '0')}/${d.year}`;
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
  if (action === 'update' && oldSnap && newSnap) {
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

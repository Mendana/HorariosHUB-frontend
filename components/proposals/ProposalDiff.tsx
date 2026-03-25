'use client';

import { useTranslations } from 'next-intl';
import type { Proposal, ClassSnapshot } from '@/lib/types/proposals';

interface ProposalDiffProps {
  proposal: Proposal;
}

type FieldKey = keyof ClassSnapshot;

const FIELDS: { key: FieldKey; labelKey: string }[] = [
  { key: 'name', labelKey: 'diffFieldName' },
  { key: 'type', labelKey: 'diffFieldType' },
  { key: 'classroom', labelKey: 'diffFieldClassroom' },
  { key: 'date', labelKey: 'diffFieldDate' },
  { key: 'startTime', labelKey: 'diffFieldStartTime' },
  { key: 'endTime', labelKey: 'diffFieldEndTime' },
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

  if (action === 'create' && newSnap) {
    return (
      <div className="mt-2 rounded-sm border border-subtle bg-surface-sunken px-3 py-2.5 text-sm">
        <table className="w-full text-left">
          <tbody>
            {FIELDS.map(({ key, labelKey }) => {
              const val = newSnap[key];
              if (val === undefined) return null;
              return (
                <tr key={key} className="border-b border-subtle last:border-0">
                  <td className="py-1 pr-4 text-xs text-tertiary w-28">{t(labelKey)}</td>
                  <td className="py-1 text-primary">{formatValue(key, val)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  if (action === 'delete' && oldSnap) {
    return (
      <div className="mt-2 rounded-sm border border-error bg-error-subtle px-3 py-2.5 text-sm">
        <table className="w-full text-left">
          <tbody>
            {FIELDS.map(({ key, labelKey }) => {
              const val = oldSnap[key];
              if (val === undefined) return null;
              return (
                <tr key={key} className="border-b border-error last:border-0">
                  <td className="py-1 pr-4 text-xs text-tertiary w-28">{t(labelKey)}</td>
                  <td className="py-1 text-error">{formatValue(key, val)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  if (action === 'update' && oldSnap && newSnap) {
    const changedFields = FIELDS.filter(
      ({ key }) => oldSnap[key] !== undefined || newSnap[key] !== undefined,
    );
    return (
      <div className="mt-2 rounded-sm border border-subtle bg-surface-sunken px-3 py-2.5 text-sm">
        <div className="grid grid-cols-[auto_1fr_1fr] gap-x-4 gap-y-1">
          <div />
          <p className="text-xs font-medium text-tertiary pb-1">{t('diffOldLabel')}</p>
          <p className="text-xs font-medium text-tertiary pb-1">{t('diffNewLabel')}</p>
          {changedFields.map(({ key, labelKey }) => (
            <>
              <p key={`${key}-label`} className="text-xs text-tertiary py-1">{t(labelKey)}</p>
              <p key={`${key}-old`} className="text-sm text-tertiary py-1 line-through">
                {formatValue(key, oldSnap[key])}
              </p>
              <p key={`${key}-new`} className="text-sm text-primary py-1 font-medium">
                {formatValue(key, newSnap[key])}
              </p>
            </>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

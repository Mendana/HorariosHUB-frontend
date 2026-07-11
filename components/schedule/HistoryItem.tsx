'use client';

import { Edit2, Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ChangeRecord, ClassSnapshot, ProposalAction } from '@/lib/types/proposals';

function formatRelative(isoDate: string, t: ReturnType<typeof useTranslations>): string {
  const diffMs = Date.now() - new Date(isoDate).getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) return t('relativeNow');
  if (diffMins < 60) return t('relativeMinutes', { n: diffMins });
  if (diffHours < 24) return t('relativeHours', { h: diffHours });
  if (diffDays === 1) return t('relativeYesterday');
  return t('relativeDays', { d: diffDays });
}

function formatFull(isoDate: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'UTC',
  }).format(new Date(isoDate));
}

type FieldKey = keyof ClassSnapshot;

const FIELD_LABELS: Record<FieldKey, string> = {
  subject: 'Asignatura',
  grp: 'Grupo',
  startsAt: 'Inicio',
  duration: 'Duración',
  classroom: 'Aula',
};

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

const ACTION_ICON: Record<ProposalAction, React.ElementType> = {
  modify: Edit2,
  create: Plus,
  delete: Trash2,
};

const ACTION_COLOR: Record<ProposalAction, string> = {
  modify: 'text-accent',
  create: 'text-success',
  delete: 'text-error',
};

function abbrevEmail(email: string): string {
  return email.split('@')[0] ?? email;
}

interface HistoryItemProps {
  record: ChangeRecord;
  locale: string;
}

export function HistoryItem({ record, locale }: HistoryItemProps) {
  const t = useTranslations('history');
  const Icon = ACTION_ICON[record.action];
  const iconColor = ACTION_COLOR[record.action];

  const oldSnap = record.old;
  const newSnap = record.new;

  const changedFields = (Object.keys(FIELD_LABELS) as FieldKey[]).filter((key) => {
    if (record.action === 'create') return newSnap?.[key] !== undefined;
    if (record.action === 'delete') return oldSnap?.[key] !== undefined;
    return oldSnap?.[key] !== undefined || newSnap?.[key] !== undefined;
  });

  return (
    <div className="py-2.5 border-b border-subtle last:border-0">
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={11} className={`${iconColor} shrink-0`} aria-hidden />
        <span
          className="text-xs text-secondary tabular-nums"
          title={formatFull(record.createdAt, locale)}
        >
          {formatRelative(record.createdAt, t)}
        </span>
        <span className="text-xs text-tertiary ml-auto truncate max-w-[90px]">
          {abbrevEmail(record.author)}
        </span>
      </div>

      {record.approvedBy && (
        <p className="text-xs text-tertiary mb-1.5">
          {t('approvedBy', { email: abbrevEmail(record.approvedBy) })}
        </p>
      )}

      <div className="space-y-0.5">
        {changedFields.map((key) => {
          const oldVal = formatValue(key, oldSnap?.[key]);
          const newVal = formatValue(key, newSnap?.[key]);
          const label = FIELD_LABELS[key];
          return (
            <p key={key} className="text-xs leading-tight">
              <span className="text-tertiary">{label}: </span>
              {record.action === 'modify' && (
                <>
                  <span className="text-tertiary">{oldVal}</span>
                  <span className="text-tertiary mx-1">→</span>
                  <span className="text-primary font-medium">{newVal}</span>
                </>
              )}
              {record.action === 'create' && (
                <span className="text-primary font-medium">{newVal}</span>
              )}
              {record.action === 'delete' && (
                <span className="text-error line-through">{oldVal}</span>
              )}
            </p>
          );
        })}
      </div>
    </div>
  );
}

'use client';

import { Edit2, Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ChangeRecord, ClassSnapshot, ProposalAction } from '@/lib/types/proposals';

// ── Relative date ──────────────────────────────────────────────────────────────

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

// ── Field formatting ───────────────────────────────────────────────────────────

type FieldKey = keyof ClassSnapshot;

const FIELD_LABELS: Record<FieldKey, string> = {
  name:            'Asignatura',
  type:            'Tipo',
  classroom:       'Aula',
  date:            'Fecha',
  startTime:       'Inicio',
  endTime:         'Fin',
  durationMinutes: 'Duración (min)',
};

function formatValue(key: FieldKey, value: ClassSnapshot[FieldKey]): string {
  if (value === undefined || value === null) return '—';
  if (key === 'date' && typeof value === 'object' && 'year' in value) {
    const d = value as { year: number; month: number; day: number };
    return `${String(d.day).padStart(2, '0')}/${String(d.month).padStart(2, '0')}/${d.year}`;
  }
  return String(value);
}

// ── Icon & color by action ─────────────────────────────────────────────────────

const ACTION_ICON: Record<ProposalAction, React.ElementType> = {
  update: Edit2,
  create: Plus,
  delete: Trash2,
};

const ACTION_COLOR: Record<ProposalAction, string> = {
  update: 'text-accent',
  create: 'text-success',
  delete: 'text-error',
};

// ── Author abbreviation ────────────────────────────────────────────────────────

function abbrevEmail(email: string): string {
  return email.split('@')[0] ?? email;
}

// ── Component ─────────────────────────────────────────────────────────────────

interface HistoryItemProps {
  record: ChangeRecord;
  locale: string;
}

export function HistoryItem({ record, locale }: HistoryItemProps) {
  const t = useTranslations('history');
  const Icon = ACTION_ICON[record.action];
  const iconColor = ACTION_COLOR[record.action];

  const { old: oldSnap, new: newSnap } = record.changes;

  // Collect fields that changed
  const changedFields = (Object.keys(FIELD_LABELS) as FieldKey[]).filter((key) => {
    if (record.action === 'create') return newSnap?.[key] !== undefined;
    if (record.action === 'delete') return oldSnap?.[key] !== undefined;
    return oldSnap?.[key] !== undefined || newSnap?.[key] !== undefined;
  });

  return (
    <div className="py-2.5 border-b border-subtle last:border-0">
      {/* Row 1: icon + relative date + author */}
      <div className="flex items-center gap-1.5 mb-1">
        <Icon size={11} className={`${iconColor} shrink-0`} aria-hidden />
        <span
          className="text-xs text-secondary tabular-nums"
          title={formatFull(record.approvedAt, locale)}
        >
          {formatRelative(record.approvedAt, t)}
        </span>
        <span className="text-xs text-tertiary ml-auto truncate max-w-[90px]">
          {abbrevEmail(record.author)}
        </span>
      </div>

      {/* Row 2: approved by */}
      <p className="text-xs text-tertiary mb-1.5">
        {t('approvedBy', { email: abbrevEmail(record.approvedBy) })}
      </p>

      {/* Row 3: changes list */}
      <div className="space-y-0.5">
        {changedFields.map((key) => {
          const oldVal = formatValue(key, oldSnap?.[key]);
          const newVal = formatValue(key, newSnap?.[key]);
          const label = FIELD_LABELS[key];
          return (
            <p key={key} className="text-xs leading-tight">
              <span className="text-tertiary">{label}: </span>
              {record.action === 'update' && (
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

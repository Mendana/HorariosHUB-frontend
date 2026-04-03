'use client';

import { useState, useEffect, useMemo } from 'react';
import { Edit2, Plus, Trash2 } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { MOCK_HISTORY } from '@/lib/mock/history';
import type { ChangeRecord, ProposalAction, ClassSnapshot } from '@/lib/types/proposals';

// ── Helpers ───────────────────────────────────────────────────────────────────

const ACTION_ICON: Record<ProposalAction, React.ElementType> = {
  update: Edit2,
  create: Plus,
  delete: Trash2,
};

const ACTION_COLOR: Record<ProposalAction, string> = {
  update: 'text-accent bg-accent-subtle',
  create: 'text-success bg-success-subtle',
  delete: 'text-error bg-error-subtle',
};

function abbrevEmail(email: string): string {
  return email.split('@')[0] ?? email;
}

function formatDate(isoDate: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'UTC',
  }).format(new Date(isoDate));
}

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

// ── Skeleton ──────────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <tbody aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="border-b border-subtle">
          {[40, 24, 60, 60, 80].map((w, j) => (
            <td key={j} className="py-3 px-4">
              <div
                className="h-3 rounded-sm bg-surface-sunken animate-pulse"
                style={{ width: `${w}%` }}
              />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

// ── Row component ─────────────────────────────────────────────────────────────

function HistoryRow({ record, locale }: { record: ChangeRecord; locale: string }) {
  const t = useTranslations('history');
  const [expanded, setExpanded] = useState(false);
  const Icon = ACTION_ICON[record.action];
  const colorCls = ACTION_COLOR[record.action];

  const { old: oldSnap, new: newSnap } = record.changes;
  const changedFields = (Object.keys(FIELD_LABELS) as FieldKey[]).filter((key) => {
    if (record.action === 'create') return newSnap?.[key] !== undefined;
    if (record.action === 'delete') return oldSnap?.[key] !== undefined;
    return oldSnap?.[key] !== undefined || newSnap?.[key] !== undefined;
  });

  const actionLabel: Record<ProposalAction, string> = {
    update: t('actionUpdate'),
    create: t('actionCreate'),
    delete: t('actionDelete'),
  };

  return (
    <>
      <tr
        className="border-b border-subtle transition-colors transition-base hover:bg-surface-raised cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <td className="py-3 px-4 text-sm text-primary font-medium">
          {record.classId}
        </td>
        <td className="py-3 px-4">
          <span className={`inline-flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded-sm ${colorCls}`}>
            <Icon size={11} aria-hidden />
            {actionLabel[record.action]}
          </span>
        </td>
        <td className="py-3 px-4 text-sm text-secondary">
          {abbrevEmail(record.author)}
        </td>
        <td className="py-3 px-4 text-sm text-secondary">
          {abbrevEmail(record.approvedBy)}
        </td>
        <td className="py-3 px-4 text-xs text-tertiary tabular-nums whitespace-nowrap">
          {formatDate(record.approvedAt, locale)}
        </td>
      </tr>

      {expanded && (
        <tr className="border-b border-subtle bg-surface-sunken">
          <td colSpan={5} className="px-4 py-2">
            <div className="space-y-0.5">
              {changedFields.map((key) => {
                const oldVal = formatValue(key, oldSnap?.[key]);
                const newVal = formatValue(key, newSnap?.[key]);
                return (
                  <p key={key} className="text-xs">
                    <span className="text-tertiary">{FIELD_LABELS[key]}: </span>
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
          </td>
        </tr>
      )}
    </>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

export function ClassHistory() {
  const t = useTranslations('history');
  const locale = useLocale();

  const [allRecords, setAllRecords] = useState<ChangeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAllRecords([...MOCK_HISTORY].sort((a, b) => b.approvedAt.localeCompare(a.approvedAt)));
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // ── Filters ──────────────────────────────────────────────────────────────
  const [subjectFilter, setSubjectFilter] = useState('');
  const [actionFilter, setActionFilter] = useState<ProposalAction | ''>('');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let result = allRecords;
    if (subjectFilter.trim()) {
      const q = subjectFilter.trim().toLowerCase();
      result = result.filter((r) => r.classId.toLowerCase().includes(q));
    }
    if (actionFilter) {
      result = result.filter((r) => r.action === actionFilter);
    }
    if (dateFilter) {
      result = result.filter((r) => r.approvedAt.startsWith(dateFilter));
    }
    return result;
  }, [allRecords, subjectFilter, actionFilter, dateFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleSubjectChange(v: string) { setSubjectFilter(v); setPage(1); }
  function handleActionChange(v: ProposalAction | '') { setActionFilter(v); setPage(1); }
  function handleDateChange(v: string) { setDateFilter(v); setPage(1); }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          value={subjectFilter}
          onChange={(e) => handleSubjectChange(e.target.value)}
          placeholder={t('filterSubjectPlaceholder')}
          className="bg-surface-sunken border border-subtle h-9 px-3 rounded-sm text-sm text-primary placeholder:text-tertiary outline-none transition-[border-color] transition-base hover:border-strong focus:border-accent w-48"
        />

        <select
          value={actionFilter}
          onChange={(e) => handleActionChange(e.target.value as ProposalAction | '')}
          className="bg-surface-sunken border border-subtle h-9 px-3 rounded-sm text-sm text-primary outline-none transition-[border-color] transition-base hover:border-strong focus:border-accent"
        >
          <option value="">{t('filterActionAll')}</option>
          <option value="create">{t('actionCreate')}</option>
          <option value="update">{t('actionUpdate')}</option>
          <option value="delete">{t('actionDelete')}</option>
        </select>

        <input
          type="date"
          value={dateFilter}
          onChange={(e) => handleDateChange(e.target.value)}
          className="bg-surface-sunken border border-subtle h-9 px-3 rounded-sm text-sm text-primary outline-none transition-[border-color] transition-base hover:border-strong focus:border-accent"
        />

        {(subjectFilter || actionFilter || dateFilter) && (
          <button
            onClick={() => { setSubjectFilter(''); setActionFilter(''); setDateFilter(''); setPage(1); }}
            className="text-xs text-secondary hover:text-primary transition-colors transition-base px-2"
          >
            {t('filterClear')}
          </button>
        )}
      </div>

      {/* Count */}
      {!isLoading && (
        <p className="mb-2 text-xs text-tertiary">
          {filtered.length} {filtered.length === 1 ? t('countOne') : t('countMany')}
        </p>
      )}

      {/* Table */}
      <div className="rounded-md border border-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-subtle bg-surface-sunken">
                <th className="py-2.5 px-4 text-xs font-medium text-tertiary">{t('colClass')}</th>
                <th className="py-2.5 px-4 text-xs font-medium text-tertiary">{t('colAction')}</th>
                <th className="py-2.5 px-4 text-xs font-medium text-tertiary">{t('colAuthor')}</th>
                <th className="py-2.5 px-4 text-xs font-medium text-tertiary">{t('colApprovedBy')}</th>
                <th className="py-2.5 px-4 text-xs font-medium text-tertiary">{t('colDate')}</th>
              </tr>
            </thead>
            {isLoading ? (
              <TableSkeleton />
            ) : paginated.length === 0 ? (
              <tbody>
                <tr>
                  <td colSpan={5} className="py-10 text-center text-sm text-tertiary">
                    {t('empty')}
                  </td>
                </tr>
              </tbody>
            ) : (
              <tbody>
                {paginated.map((record) => (
                  <HistoryRow key={record.id} record={record} locale={locale} />
                ))}
              </tbody>
            )}
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 rounded-sm border border-subtle text-secondary transition-colors transition-base hover:bg-surface-raised disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {t('paginationPrev')}
          </button>
          <span className="text-xs text-tertiary tabular-nums">
            {page} {t('paginationOf')} {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1.5 rounded-sm border border-subtle text-secondary transition-colors transition-base hover:bg-surface-raised disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {t('paginationNext')}
          </button>
        </div>
      )}
    </div>
  );
}

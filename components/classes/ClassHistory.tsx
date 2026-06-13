'use client';

import { useState, useEffect, useMemo } from 'react';
import { Edit2, Plus, Trash2 } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { MOCK_HISTORY } from '@/lib/mock/history';
import type { ChangeRecord, ProposalAction, ClassSnapshot } from '@/lib/types/proposals';

const ACTION_ICON: Record<ProposalAction, React.ElementType> = {
  modify: Edit2,
  create: Plus,
  delete: Trash2,
};

const ACTION_COLOR: Record<ProposalAction, string> = {
  modify: 'text-accent bg-accent-subtle',
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

function TableSkeleton() {
  return (
    <tbody aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="border-b border-subtle">
          {[40, 24, 60, 60, 80].map((w, j) => (
            <td key={j} className="py-3 px-4">
              <div className="h-3 rounded-sm bg-surface-sunken animate-pulse" style={{ width: `${w}%` }} />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  );
}

function HistoryRow({ record, locale }: { record: ChangeRecord; locale: string }) {
  const t = useTranslations('history');
  const [expanded, setExpanded] = useState(false);
  const Icon = ACTION_ICON[record.action];
  const colorCls = ACTION_COLOR[record.action];

  const oldSnap = record.old;
  const newSnap = record.new;
  const changedFields = (Object.keys(FIELD_LABELS) as FieldKey[]).filter((key) => {
    if (record.action === 'create') return newSnap?.[key] !== undefined;
    if (record.action === 'delete') return oldSnap?.[key] !== undefined;
    return oldSnap?.[key] !== undefined || newSnap?.[key] !== undefined;
  });

  const actionLabel: Record<ProposalAction, string> = {
    modify: t('actionUpdate'),
    create: t('actionCreate'),
    delete: t('actionDelete'),
  };

  const timestamp = record.approvedAt ?? record.createdAt;

  return (
    <>
      <tr
        className="border-b border-subtle transition-colors transition-base hover:bg-surface-raised cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <td className="py-3 px-4 text-sm text-primary font-medium">
          {record.classId ?? '—'}
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
          {record.approvedBy ? abbrevEmail(record.approvedBy) : '—'}
        </td>
        <td className="py-3 px-4 text-xs text-tertiary tabular-nums whitespace-nowrap">
          {formatDate(timestamp, locale)}
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
          </td>
        </tr>
      )}
    </>
  );
}

const PAGE_SIZE = 20;

export function ClassHistory() {
  const t = useTranslations('history');
  const locale = useLocale();

  const [allRecords, setAllRecords] = useState<ChangeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAllRecords([...MOCK_HISTORY].sort((a, b) =>
        (b.approvedAt ?? b.createdAt).localeCompare(a.approvedAt ?? a.createdAt)
      ));
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const [subjectFilter, setSubjectFilter] = useState('');
  const [actionFilter, setActionFilter] = useState<ProposalAction | ''>('');
  const [dateFilter, setDateFilter] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let result = allRecords;
    if (subjectFilter.trim()) {
      const q = subjectFilter.trim().toLowerCase();
      result = result.filter((r) => (r.classId ?? '').toLowerCase().includes(q));
    }
    if (actionFilter) {
      result = result.filter((r) => r.action === actionFilter);
    }
    if (dateFilter) {
      result = result.filter((r) => (r.approvedAt ?? r.createdAt).startsWith(dateFilter));
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
          <option value="modify">{t('actionUpdate')}</option>
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

      {!isLoading && (
        <p className="mb-2 text-xs text-tertiary">
          {filtered.length} {filtered.length === 1 ? t('countOne') : t('countMany')}
        </p>
      )}

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
                  <td colSpan={5} className="py-10 text-center text-sm text-tertiary">{t('empty')}</td>
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1.5 rounded-sm border border-subtle text-secondary transition-colors transition-base hover:bg-surface-raised disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {t('paginationPrev')}
          </button>
          <span className="text-xs text-tertiary tabular-nums">{page} {t('paginationOf')} {totalPages}</span>
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

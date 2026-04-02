'use client';

import { useTranslations } from 'next-intl';
import { Pencil, Trash2 } from 'lucide-react';
import type { Class, ClassType } from '@/lib/types/classes';
import { Table, type TableColumn } from '@/components/ui/Table';
import { PageSizeSelector } from '@/components/ui/PageSizeSelector';

export type SortCol = 'name' | 'type' | 'date';
export type SortDir = 'asc' | 'desc';

const TYPE_CLASSES: Record<ClassType, string> = {
  'Teoría':   'bg-info-subtle text-info border border-info',
  'Práctica': 'bg-warning-subtle text-warning border border-warning',
  'Examen':   'bg-error-subtle text-error border border-error',
  'Otros':    'bg-surface-sunken text-secondary border border-subtle',
};

function formatDate(d: { year: number; month: number; day: number }): string {
  return `${String(d.day).padStart(2, '0')}/${String(d.month).padStart(2, '0')}/${d.year}`;
}

interface ClassListProps {
  classes: Class[];
  isLoading: boolean;
  error: string | null;
  onEdit: (cls: Class) => void;
  onDelete: (cls: Class) => void;
  onRetry: () => void;
  sortCol: SortCol;
  sortDir: SortDir;
  onSort: (col: SortCol) => void;
  page: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function ClassList({
  classes, isLoading, error, onEdit, onDelete, onRetry,
  sortCol, sortDir, onSort,
  page, totalPages, pageSize, onPageChange, onPageSizeChange,
}: ClassListProps) {
  const t = useTranslations('classes');

  if (error) {
    return (
      <div className="mt-4 flex items-center justify-between gap-4 px-4 py-3 rounded-sm bg-error-subtle border border-error">
        <p className="text-sm text-error">{t('loadError')}</p>
        <button onClick={onRetry} className="shrink-0 text-sm font-medium text-error hover:underline">
          {t('retry')}
        </button>
      </div>
    );
  }

  // Column definitions — render functions have access to onEdit/onDelete via closure
  const columns: TableColumn<Class>[] = [
    {
      key: 'name',
      label: t('colSubject'),
      sortable: true,
      render: (cls) => (
        <span className="font-medium text-primary">{cls.name}</span>
      ),
    },
    {
      key: 'type',
      label: t('colType'),
      sortable: true,
      width: '110px',
      render: (cls) => (
        <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-sm ${TYPE_CLASSES[cls.type]}`}>
          {cls.type}
        </span>
      ),
    },
    {
      key: 'date',
      label: t('colDate'),
      sortable: true,
      width: '100px',
      render: (cls) => (
        <span className="text-secondary">{formatDate(cls.date)}</span>
      ),
    },
    {
      key: 'time',
      label: t('colTime'),
      width: '115px',
      render: (cls) => (
        <span className="text-secondary tabular-nums">{cls.startTime}–{cls.endTime}</span>
      ),
    },
    {
      key: 'classroom',
      label: t('colClassroom'),
      render: (cls) => (
        cls.classroom
          ? <span className="text-secondary">{cls.classroom}</span>
          : <span className="text-tertiary">{t('noClassroom')}</span>
      ),
    },
    {
      key: 'actions',
      label: t('colActions'),
      isActions: true,
      width: '80px',
      render: (cls) => (
        <>
          <button
            onClick={() => onEdit(cls)}
            className="p-1.5 rounded-sm text-tertiary hover:text-primary hover:bg-surface-sunken transition-colors"
            aria-label={t('edit')}
          >
            <Pencil size={14} aria-hidden />
          </button>
          <button
            onClick={() => onDelete(cls)}
            className="p-1.5 rounded-sm text-tertiary hover:text-error hover:bg-error-subtle transition-colors"
            aria-label={t('delete')}
          >
            <Trash2 size={14} aria-hidden />
          </button>
        </>
      ),
    },
  ];

  return (
    <div>
      {/* Desktop table — Table handles skeleton + empty state */}
      <div className="hidden lg:block">
        <Table
          columns={columns}
          data={classes}
          rowKey={(cls) => cls.id}
          sortKey={sortCol}
          sortDir={sortDir}
          onSort={(key) => onSort(key as SortCol)}
          isLoading={isLoading}
          emptyMessage={t('empty')}
        />
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden flex flex-col gap-3 mt-2">
        {isLoading ? (
          Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="rounded-sm border border-subtle bg-surface-raised p-3 flex flex-col gap-2">
              <div className="flex justify-between">
                <div className="h-5 w-12 rounded-sm bg-surface-sunken animate-pulse" />
                <div className="h-5 w-16 rounded-sm bg-surface-sunken animate-pulse" />
              </div>
              <div className="h-4 rounded-sm bg-surface-sunken animate-pulse" style={{ width: `${55 + i * 6}%` }} />
              <div className="h-3 w-32 rounded-sm bg-surface-sunken animate-pulse" />
            </div>
          ))
        ) : classes.length === 0 ? (
          <p className="py-10 text-center text-sm text-secondary">{t('empty')}</p>
        ) : (
          classes.map((cls) => (
            <div key={cls.id} className="rounded-sm border border-subtle bg-surface-raised p-3 flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-primary">{cls.name}</span>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-sm ${TYPE_CLASSES[cls.type]}`}>
                  {cls.type}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-secondary">
                <span>{formatDate(cls.date)}</span>
                <span className="tabular-nums">{cls.startTime}–{cls.endTime}</span>
                {cls.classroom && <span>{cls.classroom}</span>}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => onEdit(cls)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs border border-subtle rounded-sm text-secondary hover:text-primary hover:border-strong transition-colors"
                >
                  <Pencil size={12} aria-hidden />
                  {t('edit')}
                </button>
                <button
                  onClick={() => onDelete(cls)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs border border-error rounded-sm text-error hover:bg-error-subtle transition-colors"
                >
                  <Trash2 size={12} aria-hidden />
                  {t('delete')}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination row */}
      {!isLoading && !error && (
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <PageSizeSelector
            value={pageSize}
            options={[10, 20, 50]}
            onChange={onPageSizeChange}
          />
          {totalPages > 1 && (
            <div className="flex items-center gap-1 flex-wrap">
              <button
                onClick={() => onPageChange(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-2.5 py-1.5 text-sm text-secondary border border-subtle rounded-sm hover:text-primary hover:border-strong disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {t('paginationPrev')}
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => onPageChange(p)}
                  className={`w-8 h-8 text-sm rounded-sm transition-colors ${
                    p === page
                      ? 'bg-accent-subtle text-accent font-medium'
                      : 'text-secondary border border-subtle hover:text-primary hover:border-strong'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="px-2.5 py-1.5 text-sm text-secondary border border-subtle rounded-sm hover:text-primary hover:border-strong disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {t('paginationNext')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

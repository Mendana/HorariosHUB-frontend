'use client';

import { useTranslations } from 'next-intl';
import { Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Class } from '@/lib/types/classes';
import { Table, type TableColumn } from '@/components/ui/Table';
import { PageSizeSelector } from '@/components/ui/PageSizeSelector';

export type SortCol = 'name' | 'date';
export type SortDir = 'asc' | 'desc';

function formatDate(d: { year: number; month: number; day: number }): string {
  return `${String(d.day).padStart(2, '0')}/${String(d.month).padStart(2, '0')}/${d.year}`;
}

function paginationRange(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const range: (number | '…')[] = [1];
  if (current > 3) range.push('…');
  const start = Math.max(2, current - 1);
  const end   = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) range.push(i);
  if (current < total - 2) range.push('…');
  range.push(total);
  return range;
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
      <div className="mt-4 flex items-center justify-between gap-4 px-4 py-3 rounded-sm bg-error-subtle border border-error/40">
        <p className="text-sm text-error">{t('loadError')}</p>
        <button type="button" onClick={onRetry} className="shrink-0 text-sm font-medium text-error hover:underline">
          {t('retry')}
        </button>
      </div>
    );
  }

  const columns: TableColumn<Class>[] = [
    {
      key: 'name',
      label: t('colSubject'),
      sortable: true,
      render: (cls) => <span className="font-medium text-primary">{cls.name}</span>,
    },
    {
      key: 'date',
      label: t('colDate'),
      sortable: true,
      width: '100px',
      render: (cls) => <span className="text-secondary tabular-nums">{formatDate(cls.date)}</span>,
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
      render: (cls) =>
        cls.classroom
          ? <span className="text-secondary">{cls.classroom}</span>
          : <span className="text-tertiary">{t('noClassroom')}</span>,
    },
    {
      key: 'actions',
      label: t('colActions'),
      isActions: true,
      width: '80px',
      render: (cls) => (
        <>
          <button
            type="button"
            onClick={() => onEdit(cls)}
            className="p-1.5 rounded-sm text-tertiary hover:text-primary hover:bg-surface-sunken transition-colors"
            aria-label={t('edit')}
          >
            <Pencil size={14} aria-hidden />
          </button>
          <button
            type="button"
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
      {/* Desktop table */}
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
      <div className="lg:hidden flex flex-col gap-2.5 mt-2">
        {isLoading ? (
          Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="rounded-md border border-subtle bg-surface-raised p-3 flex flex-col gap-2 animate-block-in" style={{ animationDelay: `${i * 40}ms` }}>
              <div className="flex justify-between gap-2">
                <div className="h-5 w-12 rounded-full bg-surface-sunken animate-pulse" />
                <div className="h-5 w-16 rounded-sm bg-surface-sunken animate-pulse" />
              </div>
              <div className="h-4 rounded-sm bg-surface-sunken animate-pulse" style={{ width: `${55 + i * 6}%` }} />
              <div className="h-3 w-32 rounded-sm bg-surface-sunken animate-pulse" />
            </div>
          ))
        ) : classes.length === 0 ? (
          <p className="py-12 text-center text-sm text-secondary">{t('empty')}</p>
        ) : (
          classes.map((cls, i) => (
            <div key={cls.id} className="rounded-md border border-subtle bg-surface-raised p-3 flex flex-col gap-2 animate-block-in" style={{ animationDelay: `${Math.min(i * 30, 250)}ms` }}>
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-primary">{cls.name}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-secondary tabular-nums">
                <span>{formatDate(cls.date)}</span>
                <span>{cls.startTime}–{cls.endTime}</span>
                {cls.classroom && <span>{cls.classroom}</span>}
              </div>
              <div className="flex items-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => onEdit(cls)}
                  className="inline-flex items-center gap-1.5 px-2.5 h-7 text-xs border border-subtle rounded-sm text-secondary hover:text-primary hover:border-strong transition-colors"
                >
                  <Pencil size={12} aria-hidden />
                  {t('edit')}
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(cls)}
                  className="inline-flex items-center gap-1.5 px-2.5 h-7 text-xs border border-error/40 rounded-sm text-error hover:bg-error-subtle hover:border-error transition-colors"
                >
                  <Trash2 size={12} aria-hidden />
                  {t('delete')}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {!isLoading && !error && (
        <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <PageSizeSelector value={pageSize} options={[10, 20, 50]} onChange={onPageSizeChange} />
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onPageChange(Math.max(1, page - 1))}
                disabled={page === 1}
                className="size-8 flex items-center justify-center rounded-sm border border-subtle text-secondary hover:text-primary hover:border-strong transition-colors disabled:opacity-35"
                aria-label={t('paginationPrev')}
              >
                <ChevronLeft size={14} aria-hidden />
              </button>
              {paginationRange(page, totalPages).map((item, idx) =>
                item === '…' ? (
                  <span key={`e-${idx}`} className="size-8 flex items-center justify-center text-xs text-tertiary select-none">…</span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    onClick={() => onPageChange(item)}
                    aria-current={item === page ? 'page' : undefined}
                    className={[
                      'size-8 flex items-center justify-center text-xs rounded-sm border transition-colors tabular-nums',
                      item === page
                        ? 'bg-accent-subtle border-accent/40 text-accent font-medium'
                        : 'border-subtle text-secondary hover:text-primary hover:border-strong',
                    ].join(' ')}
                  >
                    {item}
                  </button>
                )
              )}
              <button
                type="button"
                onClick={() => onPageChange(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="size-8 flex items-center justify-center rounded-sm border border-subtle text-secondary hover:text-primary hover:border-strong transition-colors disabled:opacity-35"
                aria-label={t('paginationNext')}
              >
                <ChevronRight size={14} aria-hidden />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

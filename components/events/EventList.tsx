'use client';

import { useTranslations } from 'next-intl';
import { Pencil, Trash2, ChevronLeft, ChevronRight, Repeat } from 'lucide-react';
import type { EventItem } from '@/lib/types/events';
import { Table, type TableColumn } from '@/components/ui/Table';
import { PageSizeSelector } from '@/components/ui/PageSizeSelector';

function formatDateTime(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
    timeZone: 'UTC',
  }).format(new Date(iso));
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

interface EventListProps {
  events: EventItem[];
  isLoading: boolean;
  error: string | null;
  locale: string;
  onEdit: (event: EventItem) => void;
  onDelete: (event: EventItem) => void;
  onRetry: () => void;
  page: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function EventList({
  events, isLoading, error, locale, onEdit, onDelete, onRetry,
  page, totalPages, pageSize, onPageChange, onPageSizeChange,
}: EventListProps) {
  const t = useTranslations('events');

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

  const columns: TableColumn<EventItem>[] = [
    {
      key: 'title',
      label: t('colTitle'),
      render: (ev) => (
        <span className="flex items-center gap-1.5 font-medium text-primary">
          {ev.recurrence && <Repeat size={12} className="text-accent shrink-0" aria-hidden />}
          {ev.title}
        </span>
      ),
    },
    {
      key: 'subject',
      label: t('colSubject'),
      width: '110px',
      render: (ev) => <span className="text-secondary">{ev.subject}</span>,
    },
    {
      key: 'groups',
      label: t('colGroups'),
      width: '140px',
      render: (ev) => (
        <span className="text-secondary">
          {ev.groups.length > 0 ? ev.groups.join(', ') : t('allGroups')}
        </span>
      ),
    },
    {
      key: 'startTime',
      label: t('colDate'),
      width: '150px',
      render: (ev) => (
        <span className="text-secondary tabular-nums">{formatDateTime(ev.startTime, locale)}</span>
      ),
    },
    {
      key: 'actions',
      label: t('colActions'),
      isActions: true,
      width: '80px',
      render: (ev) => (
        <>
          <button
            type="button"
            onClick={() => onEdit(ev)}
            className="p-1.5 rounded-sm text-tertiary hover:text-primary hover:bg-surface-sunken transition-colors"
            aria-label={t('edit')}
          >
            <Pencil size={14} aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => onDelete(ev)}
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
          data={events}
          rowKey={(ev) => ev.id}
          isLoading={isLoading}
          emptyMessage={t('emptyList')}
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
        ) : events.length === 0 ? (
          <p className="py-12 text-center text-sm text-secondary">{t('emptyList')}</p>
        ) : (
          events.map((ev, i) => (
            <div key={ev.id} className="rounded-md border border-subtle bg-surface-raised p-3 flex flex-col gap-2 animate-block-in" style={{ animationDelay: `${Math.min(i * 30, 250)}ms` }}>
              <div className="flex items-center gap-1.5">
                {ev.recurrence && <Repeat size={12} className="text-accent shrink-0" aria-hidden />}
                <span className="text-sm font-medium text-primary">{ev.title}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-secondary tabular-nums">
                <span>{ev.subject}</span>
                <span>{ev.groups.length > 0 ? ev.groups.join(', ') : t('allGroups')}</span>
              </div>
              <div className="text-xs text-secondary tabular-nums">
                {formatDateTime(ev.startTime, locale)}
              </div>
              <div className="flex items-center gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => onEdit(ev)}
                  className="inline-flex items-center gap-1.5 px-2.5 h-7 text-xs border border-subtle rounded-sm text-secondary hover:text-primary hover:border-strong transition-colors"
                >
                  <Pencil size={12} aria-hidden />
                  {t('edit')}
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(ev)}
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

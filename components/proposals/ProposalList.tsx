'use client';

import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Proposal } from '@/lib/types/proposals';
import { TableRoot, TableHead, TableBody, TableSkeletonRows, type TableColumnDef } from '@/components/ui/Table';
import { PageSizeSelector } from '@/components/ui/PageSizeSelector';
import { ProposalRow } from './ProposalRow';
import { ProposalCard } from './ProposalCard';

interface ProposalListProps {
  proposals: Proposal[];
  total: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  error: string | null;
  emptyContext: 'pending' | 'mine' | 'filtered';
  showActions: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onRetry: () => void;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason?: string) => Promise<void>;
}

/** Smart pagination range: always shows 1, last, ±1 around current, ellipsis in gaps. */
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

export function ProposalList({
  proposals,
  total,
  page,
  pageSize,
  isLoading,
  error,
  emptyContext,
  showActions,
  onPageChange,
  onPageSizeChange,
  onRetry,
  onApprove,
  onReject,
}: ProposalListProps) {
  const t = useTranslations('proposals');

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const emptyKey =
    emptyContext === 'pending' ? 'emptyPending'
    : emptyContext === 'mine'  ? 'emptyMine'
    : 'emptyFiltered';

  const columns: TableColumnDef[] = [
    { key: 'action',  label: t('colAction'),  width: '90px'  },
    { key: 'subject', label: t('colSubject')                 },
    { key: 'author',  label: t('colAuthor'),  width: '170px' },
    { key: 'date',    label: t('colDate'),    width: '90px'  },
    { key: 'status',  label: t('colStatus'),  width: '100px' },
    { key: 'expand',  label: '',              width: '44px'  },
  ];

  /* ── Error state ─────────────────────────────────────────────────────────── */
  if (error) {
    return (
      <div className="mt-4 flex items-center justify-between gap-4 px-4 py-3 rounded-sm bg-error-subtle border border-error/40">
        <p className="text-sm text-error">{t('loadError')}</p>
        <button
          type="button"
          onClick={onRetry}
          className="shrink-0 text-sm font-medium text-error hover:underline"
        >
          {t('retry')}
        </button>
      </div>
    );
  }

  /* ── Empty state ─────────────────────────────────────────────────────────── */
  if (!isLoading && proposals.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-secondary">{t(emptyKey)}</p>
    );
  }

  return (
    <div>
      {/* ── Desktop table ──────────────────────────────────────────────────── */}
      <div className="hidden lg:block">
        <TableRoot>
          <TableHead columns={columns} />
          <TableBody>
            {isLoading
              ? <TableSkeletonRows colCount={columns.length} />
              : proposals.map((p) => (
                  <ProposalRow
                    key={p.id}
                    proposal={p}
                    showActions={showActions}
                    onApprove={onApprove}
                    onReject={onReject}
                  />
                ))
            }
          </TableBody>
        </TableRoot>
      </div>

      {/* ── Mobile cards ───────────────────────────────────────────────────── */}
      <div className="lg:hidden flex flex-col gap-2.5">
        {isLoading
          ? Array.from({ length: 5 }, (_, i) => (
              <div
                key={i}
                className="rounded-md border border-subtle bg-surface-raised p-3 flex flex-col gap-2 overflow-hidden"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                {/* Simulate action + status badge row */}
                <div className="flex justify-between gap-2">
                  <div className="h-5 w-14 rounded-full bg-surface-sunken animate-pulse" />
                  <div className="h-5 w-14 rounded-full bg-surface-sunken animate-pulse" />
                </div>
                {/* Subject name */}
                <div
                  className="h-4 rounded-sm bg-surface-sunken animate-pulse"
                  style={{ width: `${50 + i * 8}%` }}
                />
                {/* Meta */}
                <div className="h-3 w-40 rounded-sm bg-surface-sunken animate-pulse" />
              </div>
            ))
          : proposals.map((p, i) => (
              <ProposalCard
                key={p.id}
                proposal={p}
                showActions={showActions}
                index={i}
                onApprove={onApprove}
                onReject={onReject}
              />
            ))
        }
      </div>

      {/* ── Pagination ─────────────────────────────────────────────────────── */}
      {!isLoading && (
        <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <PageSizeSelector value={pageSize} options={[10, 20, 50]} onChange={onPageSizeChange} />

          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              {/* Prev */}
              <button
                type="button"
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
                className="size-8 flex items-center justify-center rounded-sm border border-subtle text-secondary hover:text-primary hover:border-strong transition-colors disabled:opacity-35"
                aria-label={t('paginationPrev')}
              >
                <ChevronLeft size={14} aria-hidden />
              </button>

              {/* Page numbers */}
              {paginationRange(page, totalPages).map((item, idx) =>
                item === '…' ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="size-8 flex items-center justify-center text-xs text-tertiary select-none"
                  >
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    onClick={() => onPageChange(item)}
                    className={[
                      'size-8 flex items-center justify-center text-xs rounded-sm border transition-colors tabular-nums',
                      item === page
                        ? 'bg-accent-subtle border-accent/40 text-accent font-medium'
                        : 'border-subtle text-secondary hover:text-primary hover:border-strong',
                    ].join(' ')}
                    aria-current={item === page ? 'page' : undefined}
                  >
                    {item}
                  </button>
                ),
              )}

              {/* Next */}
              <button
                type="button"
                onClick={() => onPageChange(page + 1)}
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

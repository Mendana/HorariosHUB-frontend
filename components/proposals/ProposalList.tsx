'use client';

import { useTranslations } from 'next-intl';
import type { Proposal } from '@/lib/types/proposals';
import { TableRoot, TableHead, TableBody, TableSkeletonRows, type TableColumnDef } from '@/components/ui/Table';
import { ProposalRow } from './ProposalRow';
import { ProposalCard } from './ProposalCard';

const PAGE_SIZE = 10;

interface ProposalListProps {
  proposals: Proposal[];
  total: number;
  page: number;
  isLoading: boolean;
  error: string | null;
  emptyContext: 'pending' | 'mine' | 'filtered';
  showActions: boolean;
  onPageChange: (page: number) => void;
  onRetry: () => void;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason?: string) => Promise<void>;
}

export function ProposalList({
  proposals,
  total,
  page,
  isLoading,
  error,
  emptyContext,
  showActions,
  onPageChange,
  onRetry,
  onApprove,
  onReject,
}: ProposalListProps) {
  const t = useTranslations('proposals');

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const emptyKey =
    emptyContext === 'pending'
      ? 'emptyPending'
      : emptyContext === 'mine'
        ? 'emptyMine'
        : 'emptyFiltered';

  // Column definitions for the header + skeleton.
  // ProposalRow handles actual row rendering — col widths here approximate row content.
  const columns: TableColumnDef[] = [
    { key: 'action',  label: t('colAction'),  width: '90px'  },
    { key: 'subject', label: t('colSubject')                 },
    { key: 'author',  label: t('colAuthor')                  },
    { key: 'date',    label: t('colDate'),    width: '100px' },
    { key: 'status',  label: t('colStatus'),  width: '100px' },
    { key: 'acts',    label: t('colActions'), isActions: true, width: '140px' },
  ];

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

  if (!isLoading && proposals.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-secondary">{t(emptyKey)}</p>
    );
  }

  return (
    <div>
      {/* Desktop table — TableRoot/TableHead/TableBody used directly so ProposalRow
          can render its own <tr> elements (including the expandable diff row). */}
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

      {/* Mobile cards */}
      <div className="lg:hidden flex flex-col gap-3">
        {isLoading
          ? Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="rounded-sm border border-subtle bg-surface-raised p-3 flex flex-col gap-2">
                <div className="flex justify-between">
                  <div className="h-5 w-16 rounded-sm bg-surface-sunken animate-pulse" />
                  <div className="h-5 w-16 rounded-sm bg-surface-sunken animate-pulse" />
                </div>
                <div className="h-4 rounded-sm bg-surface-sunken animate-pulse" style={{ width: `${60 + i * 5}%` }} />
                <div className="h-3 w-40 rounded-sm bg-surface-sunken animate-pulse" />
              </div>
            ))
          : proposals.map((p) => (
              <ProposalCard
                key={p.id}
                proposal={p}
                showActions={showActions}
                onApprove={onApprove}
                onReject={onReject}
              />
            ))
        }
      </div>

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm border border-subtle rounded-sm text-secondary hover:text-primary hover:border-strong transition-colors disabled:opacity-40"
          >
            {t('paginationPrev')}
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`px-3 py-1.5 text-sm rounded-sm border transition-colors ${
                p === page
                  ? 'bg-accent-subtle border-accent text-accent'
                  : 'border-subtle text-secondary hover:text-primary hover:border-strong'
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-sm border border-subtle rounded-sm text-secondary hover:text-primary hover:border-strong transition-colors disabled:opacity-40"
          >
            {t('paginationNext')}
          </button>
        </div>
      )}
    </div>
  );
}

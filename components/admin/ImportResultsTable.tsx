'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Table, type TableColumn } from '@/components/ui/Table';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import type { UsersImportResult, UsersImportRow, UsersImportRowStatus } from '@/lib/types/admin';

const PAGE_SIZE = 25;

const STATUS_VARIANT: Record<UsersImportRowStatus, BadgeVariant> = {
  created: 'success',
  skipped: 'warning',
  error:   'error',
};

export function ImportResultsTable({ result }: { result: UsersImportResult }) {
  const t = useTranslations('adminTools');
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(result.details.length / PAGE_SIZE));
  const paginated = result.details.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const columns: TableColumn<UsersImportRow>[] = [
    {
      key: 'email',
      label: t('colEmail'),
      render: (row) => <span className="text-primary font-mono text-xs">{row.email}</span>,
    },
    {
      key: 'status',
      label: t('colStatus'),
      width: '120px',
      render: (row) => (
        <Badge variant={STATUS_VARIANT[row.status]} size="sm">
          {t(`status_${row.status}`)}
        </Badge>
      ),
    },
    {
      key: 'reason',
      label: t('colReason'),
      render: (row) => <span className="text-secondary">{row.reason ?? '—'}</span>,
    },
  ];

  return (
    <div className="mt-4">
      <p className="text-sm text-secondary mb-3">
        {t('summary', {
          total: result.total,
          created: result.created,
          skipped: result.skipped,
          failed: result.failed,
        })}
      </p>

      <Table
        columns={columns}
        data={paginated}
        rowKey={(row) => `${(page - 1) * PAGE_SIZE + paginated.indexOf(row)}-${row.email}`}
        emptyMessage={t('emptyDetails')}
      />

      {totalPages > 1 && (
        <div className="mt-3 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="size-8 flex items-center justify-center rounded-sm border border-subtle text-secondary hover:text-primary hover:border-strong transition-colors disabled:opacity-35"
            aria-label={t('paginationPrev')}
          >
            <ChevronLeft size={14} aria-hidden />
          </button>
          <span className="text-xs text-secondary tabular-nums">
            {t('paginationStatus', { page, totalPages })}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="size-8 flex items-center justify-center rounded-sm border border-subtle text-secondary hover:text-primary hover:border-strong transition-colors disabled:opacity-35"
            aria-label={t('paginationNext')}
          >
            <ChevronRight size={14} aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
}

'use client';

import { useTranslations } from 'next-intl';
import { Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { RoleSelector } from '@/components/users/RoleSelector';
import type { User, UserRole } from '@/lib/types/users';
import { Table, type TableColumn } from '@/components/ui/Table';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { PageSizeSelector } from '@/components/ui/PageSizeSelector';

const ROLE_VARIANT: Record<UserRole, BadgeVariant> = {
  admin:    'accent',
  profesor: 'warning',
  student:  'default',
};

interface UserListProps {
  users: User[];
  isLoading: boolean;
  error: string | null;
  currentUserEmail: string;
  onChangeRole: (email: string, role: UserRole) => Promise<void>;
  onDelete: (user: User) => void;
  onRetry: () => void;
  page: number;
  totalPages: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
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

export function UserList({
  users, isLoading, error, currentUserEmail,
  onChangeRole, onDelete, onRetry,
  page, totalPages, pageSize, onPageChange, onPageSizeChange,
}: UserListProps) {
  const t      = useTranslations('users');
  const tRoles = useTranslations('roles');

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

  const columns: TableColumn<User>[] = [
    {
      key: 'email',
      label: t('colEmail'),
      render: (u) => (
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-primary truncate font-mono text-xs">{u.email}</span>
          {u.email === currentUserEmail && (
            <Badge variant="outline" size="sm">{t('you')}</Badge>
          )}
        </div>
      ),
    },
    {
      key: 'role',
      label: t('colRole'),
      width: '120px',
      render: (u) => (
        <Badge variant={ROLE_VARIANT[u.role]} size="sm">{tRoles(u.role)}</Badge>
      ),
    },
    {
      key: 'actions',
      label: t('colActions'),
      isActions: true,
      width: '190px',
      render: (u) => {
        const isSelf = u.email === currentUserEmail;
        return (
          <>
            <RoleSelector
              email={u.email}
              currentRole={u.role}
              isSelf={isSelf}
              onChangeRole={onChangeRole}
            />
            {!isSelf && (
              <button
                type="button"
                onClick={() => onDelete(u)}
                className="p-1.5 rounded-sm text-tertiary hover:text-error hover:bg-error-subtle transition-colors"
                aria-label={t('delete')}
              >
                <Trash2 size={14} aria-hidden />
              </button>
            )}
          </>
        );
      },
    },
  ];

  return (
    <div>
      {/* Desktop table */}
      <div className="hidden lg:block">
        <Table
          columns={columns}
          data={users}
          rowKey={(u) => u.id}
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
                <div className="h-4 rounded-sm bg-surface-sunken animate-pulse" style={{ width: `${50 + i * 7}%` }} />
                <div className="h-5 w-16 rounded-full bg-surface-sunken animate-pulse" />
              </div>
              <div className="h-7 w-36 rounded-sm bg-surface-sunken animate-pulse" />
            </div>
          ))
        ) : users.length === 0 ? (
          <p className="py-12 text-center text-sm text-secondary">{t('empty')}</p>
        ) : (
          users.map((u, i) => {
            const isSelf = u.email === currentUserEmail;
            return (
              <div key={u.id} className="rounded-md border border-subtle bg-surface-raised p-3 flex flex-col gap-2 animate-block-in" style={{ animationDelay: `${Math.min(i * 30, 250)}ms` }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs text-primary truncate font-mono">{u.email}</span>
                    {isSelf && (
                      <Badge variant="outline" size="sm">{t('you')}</Badge>
                    )}
                  </div>
                  <Badge variant={ROLE_VARIANT[u.role]} size="sm">{tRoles(u.role)}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <RoleSelector
                    email={u.email}
                    currentRole={u.role}
                    isSelf={isSelf}
                    onChangeRole={onChangeRole}
                  />
                  {!isSelf && (
                    <button
                      type="button"
                      onClick={() => onDelete(u)}
                      className="inline-flex items-center gap-1.5 px-2.5 h-7 text-xs border border-error/40 rounded-sm text-error hover:bg-error-subtle hover:border-error transition-colors"
                    >
                      <Trash2 size={12} aria-hidden />
                      {t('delete')}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {!isLoading && !error && (
        <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <PageSizeSelector value={pageSize} options={[20, 50, 100]} onChange={onPageSizeChange} />
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

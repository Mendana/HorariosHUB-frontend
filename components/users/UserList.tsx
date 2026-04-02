'use client';

import { useTranslations } from 'next-intl';
import { Trash2 } from 'lucide-react';
import { RoleSelector } from '@/components/users/RoleSelector';
import type { User, UserRole } from '@/lib/types/users';
import { Table, type TableColumn } from '@/components/ui/Table';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { PageSizeSelector } from '@/components/ui/PageSizeSelector';

const ROLE_VARIANT: Record<UserRole, BadgeVariant> = {
  admin:     'accent',
  professor: 'warning',
  user:      'default',
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

export function UserList({
  users, isLoading, error, currentUserEmail,
  onChangeRole, onDelete, onRetry,
  page, totalPages, pageSize, onPageChange, onPageSizeChange,
}: UserListProps) {
  const t      = useTranslations('users');
  const tRoles = useTranslations('roles');

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

  const columns: TableColumn<User>[] = [
    {
      key: 'email',
      label: t('colEmail'),
      render: (u) => (
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-primary truncate">{u.email}</span>
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
          rowKey={(u) => u.email}
          isLoading={isLoading}
          emptyMessage={t('empty')}
        />
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden flex flex-col gap-3 mt-2">
        {isLoading ? (
          Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="rounded-sm border border-subtle bg-surface-raised p-3 flex flex-col gap-2">
              <div className="flex justify-between gap-2">
                <div
                  className="h-5 rounded-sm bg-surface-sunken animate-pulse"
                  style={{ width: `${50 + i * 7}%` }}
                />
                <div className="h-5 w-20 rounded-sm bg-surface-sunken animate-pulse" />
              </div>
              <div className="h-8 w-36 rounded-sm bg-surface-sunken animate-pulse" />
            </div>
          ))
        ) : users.length === 0 ? (
          <p className="py-10 text-center text-sm text-secondary">{t('empty')}</p>
        ) : (
          users.map((u) => {
            const isSelf = u.email === currentUserEmail;
            return (
              <div key={u.email} className="rounded-sm border border-subtle bg-surface-raised p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm text-primary truncate">{u.email}</span>
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
                      onClick={() => onDelete(u)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs border border-error rounded-sm text-error hover:bg-error-subtle transition-colors"
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

      {/* Pagination row */}
      {!isLoading && !error && (
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <PageSizeSelector
            value={pageSize}
            options={[20, 50, 100]}
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

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import { useUsers } from '@/lib/hooks/useUsers';
import { UserList } from '@/components/users/UserList';
import { UserFilters } from '@/components/users/UserFilters';
import { UserDeleteConfirm } from '@/components/users/UserDeleteConfirm';
import type { User, UserRole } from '@/lib/types/users';

const PAGE_SIZE = 20;

export default function ManageUsersPage() {
  const t = useTranslations('users');
  const { user: currentUser } = useAuth();
  const router = useRouter();

  // Auth + role guard (admin only)
  useEffect(() => {
    if (currentUser === null) {
      router.push('/auth/login');
    } else if (currentUser.role !== 'admin') {
      router.push('/');
    }
  }, [currentUser, router]);

  const { users, isLoading, error, changeRole, deleteUser } = useUsers();

  // Filter state
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);

  // Delete modal
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const hasActiveFilters = search !== '' || roleFilter !== '';

  function handleSearchChange(v: string) { setSearch(v); setPage(1); }
  function handleRoleChange(v: string)   { setRoleFilter(v); setPage(1); }
  function handleClearFilters()          { setSearch(''); setRoleFilter(''); setPage(1); }

  // Filter → paginate
  const filtered = useMemo(() => {
    let result = users;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((u) => u.email.toLowerCase().includes(q));
    }
    if (roleFilter) {
      result = result.filter((u) => u.role === roleFilter);
    }
    return result;
  }, [users, search, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    await deleteUser(deleteTarget.email);
    setDeleteTarget(null);
  }

  // Prevent rendering while redirecting
  if (currentUser === null || currentUser.role !== 'admin') return null;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
      <h1 className="text-xl font-semibold text-primary mb-4">{t('title')}</h1>

      <UserFilters
        search={search}
        role={roleFilter}
        total={filtered.length}
        hasActiveFilters={hasActiveFilters}
        onSearchChange={handleSearchChange}
        onRoleChange={handleRoleChange}
        onClear={handleClearFilters}
      />

      <UserList
        users={paginated}
        isLoading={isLoading}
        error={error}
        currentUserEmail={currentUser.email}
        onChangeRole={(email: string, role: UserRole) => changeRole(email, role)}
        onDelete={(u) => setDeleteTarget(u)}
        onRetry={() => {}}
      />

      {/* Pagination */}
      {!isLoading && !error && totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-2.5 py-1.5 text-sm text-secondary border border-subtle rounded-sm hover:text-primary hover:border-strong disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {t('paginationPrev')}
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
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
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-2.5 py-1.5 text-sm text-secondary border border-subtle rounded-sm hover:text-primary hover:border-strong disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {t('paginationNext')}
          </button>
        </div>
      )}

      {/* Delete modal */}
      {deleteTarget && (
        <UserDeleteConfirm
          email={deleteTarget.email}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}

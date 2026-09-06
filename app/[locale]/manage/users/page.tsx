'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import { useUsers } from '@/lib/hooks/useUsers';
import { UserList } from '@/components/users/UserList';
import { UserFilters } from '@/components/users/UserFilters';
import { UserDeleteConfirm } from '@/components/users/UserDeleteConfirm';
import type { User, UserRole } from '@/lib/types/users';

const DEFAULT_PAGE_SIZE = 20;

export default function ManageUsersPage() {
  const t = useTranslations('users');
  const { user: currentUser, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Auth + role guard (admin only)
  useEffect(() => {
    if (authLoading) return;
    if (currentUser === null) {
      router.push('/auth/login');
    } else if (currentUser.role !== 'admin') {
      router.push('/');
    }
  }, [currentUser, authLoading, router]);

  const { users, isLoading, error, changeRole, deleteUser } = useUsers(
    !!currentUser && currentUser.role === 'admin',
  );

  // Filter state
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(() =>
    typeof window !== 'undefined' ? Number(localStorage.getItem('usersPageSize')) || DEFAULT_PAGE_SIZE : DEFAULT_PAGE_SIZE,
  );

  function handlePageSizeChange(size: number) {
    setPageSize(size);
    setPage(1);
    localStorage.setItem('usersPageSize', String(size));
  }

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

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    await deleteUser(deleteTarget.email);
    setDeleteTarget(null);
  }

  // Prevent rendering while redirecting
  if (authLoading || currentUser === null || currentUser.role !== 'admin') return null;

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 pb-12">
      <div className="pt-6 pb-5 border-b border-subtle mb-6">
        <h1 className="text-xl font-semibold text-primary leading-tight">{t('title')}</h1>
        <p className="mt-1 text-sm text-secondary leading-snug max-w-xl">{t('subtitle')}</p>
      </div>

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
        onChangeRole={(id: string, role: UserRole) => changeRole(id, role)}
        onDelete={(u) => setDeleteTarget(u)}
        onRetry={() => {}}
        page={page}
        totalPages={totalPages}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={handlePageSizeChange}
      />

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

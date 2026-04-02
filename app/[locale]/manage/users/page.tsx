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

const DEFAULT_PAGE_SIZE = 20;

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

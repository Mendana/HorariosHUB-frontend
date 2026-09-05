'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useClasses } from '@/lib/hooks/useClasses';
import { ClassList, type SortCol, type SortDir } from '@/components/classes/ClassList';
import { ClassFilters } from '@/components/classes/ClassFilters';
import { ClassForm } from '@/components/classes/ClassForm';
import { ClassDeleteConfirm } from '@/components/classes/ClassDeleteConfirm';
import { ClassHistory } from '@/components/classes/ClassHistory';
import type { Class, ClassInput } from '@/lib/types/classes';

type Modal =
  | { kind: 'none' }
  | { kind: 'create' }
  | { kind: 'edit'; cls: Class }
  | { kind: 'delete'; cls: Class };

type PageTab = 'classes' | 'history';

const DEFAULT_PAGE_SIZE = 10;

export default function ManageClassesPage() {
  const t = useTranslations('classes');
  const th = useTranslations('history');
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (user === null) {
      router.push('/auth/login');
    } else if (user.role === 'student') {
      router.push('/');
    }
  }, [user, authLoading, router]);

  const [modal, setModal] = useState<Modal>({ kind: 'none' });
  const [pageTab, setPageTab] = useState<PageTab>('classes');

  // Filter state
  const [search, setSearch] = useState('');
  const [weekFilter, setWeekFilter] = useState('');

  // Sort state
  const [sortCol, setSortCol] = useState<SortCol>('date');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(() =>
    typeof window !== 'undefined' ? Number(localStorage.getItem('classesPageSize')) || DEFAULT_PAGE_SIZE : DEFAULT_PAGE_SIZE,
  );

  const { classes, total, isLoading, error, refetch, createClass, updateClass, deleteClass } = useClasses(
    {
      search,
      week: weekFilter,
      sort: sortCol,
      dir: sortDir,
      page,
      limit: pageSize,
    },
    !!user && user.role !== 'student',
  );

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const hasActiveFilters = search !== '' || weekFilter !== '';

  function handleSearchChange(v: string) { setSearch(v);     setPage(1); }
  function handleWeekChange(v: string)   { setWeekFilter(v); setPage(1); }
  function handleClearFilters()          { setSearch(''); setWeekFilter(''); setPage(1); }

  function handlePageSizeChange(size: number) {
    setPageSize(size);
    setPage(1);
    localStorage.setItem('classesPageSize', String(size));
  }

  function handleSort(col: SortCol) {
    if (col === sortCol) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
    setPage(1);
  }

  const handleCreate = useCallback(async (input: ClassInput) => {
    await createClass(input);
    setModal({ kind: 'none' });
  }, [createClass]);

  const handleUpdate = useCallback(async (id: string, input: ClassInput) => {
    await updateClass(id, input);
    setModal({ kind: 'none' });
  }, [updateClass]);

  const handleDelete = useCallback(async (id: string) => {
    await deleteClass(id);
    setModal({ kind: 'none' });
  }, [deleteClass]);

  if (authLoading || user === null || user.role === 'student') return null;

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 pb-12">
      {/* Page header */}
      <div className="pt-6 pb-5 border-b border-subtle mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-primary leading-tight">{t('title')}</h1>
            <p className="mt-1 text-sm text-secondary leading-snug max-w-xl">{t('subtitle')}</p>
          </div>
          {pageTab === 'classes' && (
            <Button variant="primary" size="sm" iconLeft={Plus} onClick={() => setModal({ kind: 'create' })}>
              {t('newClass')}
            </Button>
          )}
        </div>
      </div>

      {/* Page tabs */}
      <div className="flex items-center bg-surface-raised border border-subtle rounded-md p-1 gap-0.5 w-fit mb-6">
        {(['classes', 'history'] as PageTab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setPageTab(tab)}
            className={[
              'px-3 py-1.5 text-sm rounded-sm transition-[background-color,color,box-shadow] duration-150',
              pageTab === tab
                ? 'bg-surface-base shadow-sm text-primary font-medium'
                : 'text-secondary hover:text-primary',
            ].join(' ')}
          >
            {tab === 'classes' ? t('title') : th('tabTitle')}
          </button>
        ))}
      </div>

      {pageTab === 'classes' && (
        <>
          <ClassFilters
            search={search}
            week={weekFilter}
            hasActiveFilters={hasActiveFilters}
            onSearchChange={handleSearchChange}
            onWeekChange={handleWeekChange}
            onClear={handleClearFilters}
          />

          {!isLoading && !error && (
            <p className="mb-2 text-xs text-tertiary">
              {total === 1
                ? t('countFoundOne')
                : t('countFoundMany', { count: total })}
            </p>
          )}

          <ClassList
            classes={classes}
            isLoading={isLoading}
            error={error}
            sortCol={sortCol}
            sortDir={sortDir}
            onSort={handleSort}
            onEdit={(cls) => setModal({ kind: 'edit', cls })}
            onDelete={(cls) => setModal({ kind: 'delete', cls })}
            onRetry={refetch}
            page={page}
            totalPages={totalPages}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={handlePageSizeChange}
          />
        </>
      )}

      {pageTab === 'history' && <ClassHistory />}

      {modal.kind === 'create' && (
        <ClassForm
          onSubmit={handleCreate}
          onClose={() => setModal({ kind: 'none' })}
        />
      )}

      {modal.kind === 'edit' && (
        <ClassForm
          initial={modal.cls}
          onSubmit={(input) => handleUpdate(modal.cls.id, input)}
          onClose={() => setModal({ kind: 'none' })}
        />
      )}

      {modal.kind === 'delete' && (
        <ClassDeleteConfirm
          cls={modal.cls}
          onConfirm={() => handleDelete(modal.cls.id)}
          onClose={() => setModal({ kind: 'none' })}
        />
      )}
    </div>
  );
}

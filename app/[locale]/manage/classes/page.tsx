'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useClasses } from '@/lib/hooks/useClasses';
import { ClassList, type SortCol, type SortDir } from '@/components/classes/ClassList';
import { ClassFilters } from '@/components/classes/ClassFilters';
import { ClassForm, PCEO_SUBJECTS } from '@/components/classes/ClassForm';
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

// ── Week filter helpers ────────────────────────────────────────────────────────

function getWeekBounds(weekStr: string): { start: Date; end: Date } | null {
  const match = weekStr.match(/^(\d{4})-W(\d{2})$/);
  if (!match) return null;
  const year = Number(match[1]);
  const week = Number(match[2]);
  // ISO 8601: find Monday of week 1, then advance (week-1)*7 days
  const jan4 = new Date(year, 0, 4);
  const dow = jan4.getDay() || 7; // 1=Mon … 7=Sun
  const mondayW1 = new Date(jan4);
  mondayW1.setDate(jan4.getDate() - (dow - 1));
  const monday = new Date(mondayW1);
  monday.setDate(mondayW1.getDate() + (week - 1) * 7);
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);
  return { start: monday, end: friday };
}

function classInWeek(cls: Class, weekStr: string): boolean {
  const bounds = getWeekBounds(weekStr);
  if (!bounds) return true;
  const d = new Date(cls.date.year, cls.date.month - 1, cls.date.day);
  return d >= bounds.start && d <= bounds.end;
}

// Subject name lookup for full-text search
const SUBJECT_NAME: Record<string, string> = Object.fromEntries(
  PCEO_SUBJECTS.map((s) => [s.code, s.name.toLowerCase()]),
);

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ManageClassesPage() {
  const t = useTranslations('classes');
  const th = useTranslations('history');
  const { user } = useAuth();
  const router = useRouter();

  // Auth + role guard
  useEffect(() => {
    if (user === null) {
      router.push('/auth/login');
    } else if (user.role === 'user') {
      router.push('/');
    }
  }, [user, router]);

  const { classes, isLoading, error, createClass, updateClass, deleteClass } = useClasses();
  const [modal, setModal] = useState<Modal>({ kind: 'none' });
  const [pageTab, setPageTab] = useState<PageTab>('classes');

  const [retryTick, setRetryTick] = useState(0);
  void retryTick;

  // ── Filter state ──────────────────────────────────────────────────────────
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [weekFilter, setWeekFilter] = useState('');

  // ── Sort state ────────────────────────────────────────────────────────────
  const [sortCol, setSortCol] = useState<SortCol>('date');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  // ── Pagination ────────────────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(() =>
    typeof window !== 'undefined' ? Number(localStorage.getItem('classesPageSize')) || DEFAULT_PAGE_SIZE : DEFAULT_PAGE_SIZE,
  );

  function handlePageSizeChange(size: number) {
    setPageSize(size);
    setPage(1);
    localStorage.setItem('classesPageSize', String(size));
  }

  const hasActiveFilters = search !== '' || typeFilter !== '' || weekFilter !== '';

  function handleSearchChange(v: string) { setSearch(v); setPage(1); }
  function handleTypeChange(v: string)   { setTypeFilter(v); setPage(1); }
  function handleWeekChange(v: string)   { setWeekFilter(v); setPage(1); }
  function handleClearFilters()          { setSearch(''); setTypeFilter(''); setWeekFilter(''); setPage(1); }

  function handleSort(col: SortCol) {
    if (col === sortCol) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(col);
      setSortDir('asc');
    }
    setPage(1);
  }

  // ── Filter → Sort → Paginate ──────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = classes;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (c) => c.name.toLowerCase().includes(q) || (SUBJECT_NAME[c.name] ?? '').includes(q),
      );
    }
    if (typeFilter) {
      result = result.filter((c) => c.type === typeFilter);
    }
    if (weekFilter) {
      result = result.filter((c) => classInWeek(c, weekFilter));
    }
    return result;
  }, [classes, search, typeFilter, weekFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let cmp = 0;
      if (sortCol === 'date') {
        const da = a.date.year * 10000 + a.date.month * 100 + a.date.day;
        const db = b.date.year * 10000 + b.date.month * 100 + b.date.day;
        cmp = da - db || a.startTime.localeCompare(b.startTime);
      } else if (sortCol === 'name') {
        cmp = a.name.localeCompare(b.name);
      } else if (sortCol === 'type') {
        cmp = a.type.localeCompare(b.type);
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortCol, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  // ── CRUD handlers ─────────────────────────────────────────────────────────
  const handleCreate = useCallback(
    async (input: ClassInput) => {
      await createClass(input);
      setModal({ kind: 'none' });
    },
    [createClass],
  );

  const handleUpdate = useCallback(
    async (id: string, input: ClassInput) => {
      await updateClass(id, input);
      setModal({ kind: 'none' });
    },
    [updateClass],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteClass(id);
      setModal({ kind: 'none' });
    },
    [deleteClass],
  );

  // Prevent rendering while redirecting
  if (user === null || user.role === 'user') return null;

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

      {/* Page tabs — segmented tray */}
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
          {/* Filters */}
          <ClassFilters
            search={search}
            type={typeFilter}
            week={weekFilter}
            hasActiveFilters={hasActiveFilters}
            onSearchChange={handleSearchChange}
            onTypeChange={handleTypeChange}
            onWeekChange={handleWeekChange}
            onClear={handleClearFilters}
          />

          {/* Count */}
          {!isLoading && !error && (
            <p className="mb-2 text-xs text-tertiary">
              {sorted.length === 1
                ? t('countFoundOne')
                : t('countFoundMany', { count: sorted.length })}
            </p>
          )}

          <ClassList
            classes={paginated}
            isLoading={isLoading}
            error={error}
            sortCol={sortCol}
            sortDir={sortDir}
            onSort={handleSort}
            onEdit={(cls) => setModal({ kind: 'edit', cls })}
            onDelete={(cls) => setModal({ kind: 'delete', cls })}
            onRetry={() => setRetryTick((n) => n + 1)}
            page={page}
            totalPages={totalPages}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={handlePageSizeChange}
          />
        </>
      )}

      {pageTab === 'history' && <ClassHistory />}

      {/* Modals */}
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

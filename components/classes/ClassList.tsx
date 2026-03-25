'use client';

import { useTranslations } from 'next-intl';
import { Pencil, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import type { Class, ClassType } from '@/lib/types/classes';

export type SortCol = 'name' | 'type' | 'date';
export type SortDir = 'asc' | 'desc';

const SKELETON_ROWS = 5;

const TYPE_CLASSES: Record<ClassType, string> = {
  'Teoría':   'bg-info-subtle text-info border border-info',
  'Práctica': 'bg-warning-subtle text-warning border border-warning',
  'Examen':   'bg-error-subtle text-error border border-error',
  'Otros':    'bg-surface-sunken text-secondary border border-subtle',
};

function formatDate(d: { year: number; month: number; day: number }): string {
  return `${String(d.day).padStart(2, '0')}/${String(d.month).padStart(2, '0')}/${d.year}`;
}

interface SortHeaderProps {
  col: SortCol;
  label: string;
  sortCol: SortCol;
  sortDir: SortDir;
  onSort: (col: SortCol) => void;
}

function SortHeader({ col, label, sortCol, sortDir, onSort }: SortHeaderProps) {
  const active = col === sortCol;
  return (
    <th
      className="pb-2 px-3 text-xs font-medium text-tertiary"
      aria-sort={active ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <button
        onClick={() => onSort(col)}
        className="inline-flex items-center gap-1 hover:text-primary transition-colors"
      >
        {label}
        {active ? (
          sortDir === 'asc'
            ? <ChevronUp size={12} aria-hidden />
            : <ChevronDown size={12} aria-hidden />
        ) : (
          <ChevronUp size={12} className="opacity-30" aria-hidden />
        )}
      </button>
    </th>
  );
}

interface ClassListProps {
  classes: Class[];
  isLoading: boolean;
  error: string | null;
  onEdit: (cls: Class) => void;
  onDelete: (cls: Class) => void;
  onRetry: () => void;
  sortCol: SortCol;
  sortDir: SortDir;
  onSort: (col: SortCol) => void;
}

export function ClassList({
  classes, isLoading, error, onEdit, onDelete, onRetry,
  sortCol, sortDir, onSort,
}: ClassListProps) {
  const t = useTranslations('classes');

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

  if (isLoading) {
    return (
      <>
        {/* Desktop skeleton */}
        <div className="hidden lg:block mt-2">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-subtle">
                {[t('colSubject'), t('colType'), t('colDate'), t('colTime'), t('colClassroom'), t('colActions')].map(
                  (col) => (
                    <th key={col} className="pb-2 px-3 text-xs font-medium text-tertiary">{col}</th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: SKELETON_ROWS }, (_, i) => (
                <tr key={i} className="border-b border-subtle">
                  {[12, 18, 20, 18, 22, 12].map((w, j) => (
                    <td key={j} className="py-3 px-3">
                      <div
                        className="h-5 rounded-sm bg-surface-raised animate-pulse"
                        style={{ width: `${w + (i % 3) * 4}%` }}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Mobile skeleton */}
        <div className="lg:hidden flex flex-col gap-3 mt-2">
          {Array.from({ length: SKELETON_ROWS }, (_, i) => (
            <div key={i} className="rounded-sm border border-subtle bg-surface-raised p-3 flex flex-col gap-2">
              <div className="flex justify-between">
                <div className="h-5 w-12 rounded-sm bg-surface-sunken animate-pulse" />
                <div className="h-5 w-16 rounded-sm bg-surface-sunken animate-pulse" />
              </div>
              <div className="h-4 rounded-sm bg-surface-sunken animate-pulse" style={{ width: `${55 + i * 6}%` }} />
              <div className="h-3 w-32 rounded-sm bg-surface-sunken animate-pulse" />
            </div>
          ))}
        </div>
      </>
    );
  }

  if (classes.length === 0) {
    return <p className="py-10 text-center text-sm text-secondary">{t('empty')}</p>;
  }

  return (
    <div>
      {/* Desktop table */}
      <div className="hidden lg:block mt-2">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-subtle">
              <SortHeader col="name" label={t('colSubject')} sortCol={sortCol} sortDir={sortDir} onSort={onSort} />
              <SortHeader col="type" label={t('colType')}    sortCol={sortCol} sortDir={sortDir} onSort={onSort} />
              <SortHeader col="date" label={t('colDate')}    sortCol={sortCol} sortDir={sortDir} onSort={onSort} />
              <th className="pb-2 px-3 text-xs font-medium text-tertiary">{t('colTime')}</th>
              <th className="pb-2 px-3 text-xs font-medium text-tertiary">{t('colClassroom')}</th>
              <th className="pb-2 px-3 text-xs font-medium text-tertiary">{t('colActions')}</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((cls) => (
              <tr key={cls.id} className="border-b border-subtle hover:bg-surface-raised transition-colors">
                <td className="py-3 px-3 text-sm font-medium text-primary">{cls.name}</td>
                <td className="py-3 px-3">
                  <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-sm ${TYPE_CLASSES[cls.type]}`}>
                    {cls.type}
                  </span>
                </td>
                <td className="py-3 px-3 text-sm text-secondary">{formatDate(cls.date)}</td>
                <td className="py-3 px-3 text-sm text-secondary tabular-nums">
                  {cls.startTime}–{cls.endTime}
                </td>
                <td className="py-3 px-3 text-sm text-secondary">
                  {cls.classroom ?? <span className="text-tertiary">{t('noClassroom')}</span>}
                </td>
                <td className="py-3 px-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEdit(cls)}
                      className="p-1.5 rounded-sm text-tertiary hover:text-primary hover:bg-surface-sunken transition-colors"
                      aria-label={t('edit')}
                    >
                      <Pencil size={14} aria-hidden />
                    </button>
                    <button
                      onClick={() => onDelete(cls)}
                      className="p-1.5 rounded-sm text-tertiary hover:text-error hover:bg-error-subtle transition-colors"
                      aria-label={t('delete')}
                    >
                      <Trash2 size={14} aria-hidden />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="lg:hidden flex flex-col gap-3 mt-2">
        {classes.map((cls) => (
          <div key={cls.id} className="rounded-sm border border-subtle bg-surface-raised p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-primary">{cls.name}</span>
              <span className={`px-2 py-0.5 text-xs font-medium rounded-sm ${TYPE_CLASSES[cls.type]}`}>
                {cls.type}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-secondary">
              <span>{formatDate(cls.date)}</span>
              <span className="tabular-nums">{cls.startTime}–{cls.endTime}</span>
              {cls.classroom && <span>{cls.classroom}</span>}
            </div>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => onEdit(cls)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs border border-subtle rounded-sm text-secondary hover:text-primary hover:border-strong transition-colors"
              >
                <Pencil size={12} aria-hidden />
                {t('edit')}
              </button>
              <button
                onClick={() => onDelete(cls)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs border border-error rounded-sm text-error hover:bg-error-subtle transition-colors"
              >
                <Trash2 size={12} aria-hidden />
                {t('delete')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

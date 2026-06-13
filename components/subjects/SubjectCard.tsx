'use client';

import { useCallback } from 'react';
import { useTranslations } from 'next-intl';
import type { CatalogSubject } from '@/lib/types/subjects';
import { getSubjectColorVars } from '@/lib/config/subjectColors';

interface SubjectCardProps {
  subject: CatalogSubject;
  localSelection: Set<string>;
  onToggle: (groupId: string) => void;
  /** Position index — drives staggered entry animation */
  index?: number;
}

export function SubjectCard({ subject, localSelection, onToggle, index = 0 }: SubjectCardProps) {
  const t = useTranslations('mySubjects');

  const total         = subject.groups.length;
  const selectedCount = subject.groups.filter((g) => localSelection.has(g.id)).length;
  const allSelected   = selectedCount === total && total > 0;
  const noneSelected  = selectedCount === 0;

  const colorVars   = getSubjectColorVars(subject.code);
  const borderColor = colorVars['--sb-border'];

  // Stagger: 25ms per card
  const staggerDelay = `${Math.min(index * 25, 300)}ms`;

  // Select/deselect all toggle
  const handleSelectAll = useCallback(() => {
    if (allSelected) {
      subject.groups.forEach((g) => { if (localSelection.has(g.id))  onToggle(g.id); });
    } else {
      subject.groups.forEach((g) => { if (!localSelection.has(g.id)) onToggle(g.id); });
    }
  }, [allSelected, subject.groups, localSelection, onToggle]);

  const selectAllLabel = allSelected ? t('deselectAll') : t('selectAll');

  return (
    <div
      className="animate-block-in group relative flex flex-col bg-surface-raised border border-subtle rounded-md overflow-hidden hover:border-strong/60 transition-[border-color,box-shadow] transition-base hover:shadow-sm"
      style={{ animationDelay: staggerDelay }}
    >
      {/* ── Top color bar ──────────────────────────────────────────────────── */}
      <span
        aria-hidden
        className="block h-[3px] w-full shrink-0"
        style={{ backgroundColor: borderColor }}
      />

      {/* ── Card body ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 p-3 gap-3">

        {/* Header: name + code + status */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm font-medium text-primary leading-snug font-mono tracking-wide">
              {subject.code}
            </h3>
          </div>

          {/* Selected badge */}
          <span
            className={[
              'shrink-0 text-[11px] font-medium px-1.5 py-0.5 rounded-sm leading-none',
              allSelected
                ? 'bg-success-subtle text-success'
                : selectedCount > 0
                ? 'bg-accent-subtle text-accent'
                : 'bg-surface-sunken text-tertiary',
            ].join(' ')}
          >
            {allSelected
              ? t('allGroupsSelected')
              : noneSelected
              ? t('noGroupSelected')
              : t('groupsSelected', { selected: selectedCount, total })}
          </span>
        </div>

        {/* ── Group list ───────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-1 flex-1">
          {subject.groups.map((group) => {
            const isChecked = localSelection.has(group.id);
            return (
              <button
                key={group.id}
                type="button"
                onClick={() => onToggle(group.id)}
                className={[
                  'flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-sm',
                  'border transition-[background-color,border-color] transition-fast text-xs',
                  isChecked
                    ? 'bg-accent-subtle border-accent/30 text-primary'
                    : 'bg-surface-base border-subtle text-secondary hover:text-primary hover:border-strong/40',
                ].join(' ')}
              >
                {/* Mini dot indicator */}
                <span
                  aria-hidden
                  className={[
                    'size-1.5 rounded-full shrink-0 transition-[background-color] transition-fast',
                    isChecked ? 'bg-accent' : 'bg-border-strong/40',
                  ].join(' ')}
                />
                <span className="truncate">{group.name}</span>
              </button>
            );
          })}
        </div>

        {/* ── Footer: select all / deselect all ────────────────────────────── */}
        <button
          type="button"
          onClick={handleSelectAll}
          className={[
            'w-full text-[11px] font-medium py-1 rounded-sm border transition-[background-color,color,border-color] transition-fast',
            allSelected
              ? 'text-secondary border-subtle hover:text-error hover:border-error/40 hover:bg-error-subtle'
              : 'text-accent border-accent/30 bg-accent-subtle hover:bg-accent-subtle/70',
          ].join(' ')}
        >
          {selectAllLabel}
        </button>
      </div>
    </div>
  );
}

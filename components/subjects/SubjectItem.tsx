'use client';

import { useState, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { CatalogSubject } from '@/lib/types/subjects';
import { GroupItem } from './GroupItem';
import { Checkbox } from '@/components/ui/Checkbox';
import { getSubjectColorVars } from '@/lib/config/subjectColors';

interface SubjectItemProps {
  subject: CatalogSubject;
  localSelection: Set<string>;
  onToggle: (groupId: string) => void;
  /** Position index — drives staggered entry animation */
  index?: number;
}

export function SubjectItem({ subject, localSelection, onToggle, index = 0 }: SubjectItemProps) {
  const t = useTranslations('mySubjects');
  const [isOpen, setIsOpen] = useState(false);

  const total         = subject.groups.length;
  const selectedCount = subject.groups.filter((g) => localSelection.has(g.id)).length;
  const allSelected   = selectedCount === total && total > 0;
  const isIndeterminate = selectedCount > 0 && !allSelected;

  const colorVars  = getSubjectColorVars(subject.code);
  const borderColor = colorVars['--sb-border'];

  const handleHeaderCheckboxChange = useCallback(() => {
    if (allSelected) {
      subject.groups.forEach((g) => { if (localSelection.has(g.id))  onToggle(g.id); });
    } else {
      subject.groups.forEach((g) => { if (!localSelection.has(g.id)) onToggle(g.id); });
    }
  }, [allSelected, subject.groups, localSelection, onToggle]);

  // Status badge styling
  const badgeClass = allSelected
    ? 'bg-success-subtle text-success'
    : isIndeterminate
    ? 'bg-accent-subtle text-accent'
    : 'bg-surface-sunken text-tertiary';

  const badgeLabel = t('groupsSelected', { selected: selectedCount, total });

  // Stagger: 30ms per item, capped at 250ms so the list doesn't drag
  const staggerDelay = `${Math.min(index * 30, 250)}ms`;

  return (
    <div
      className="border-b border-subtle last:border-b-0 animate-block-in"
      style={{ animationDelay: staggerDelay }}
    >
      {/* ── Header row ───────────────────────────────────────────────────────── */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen((o) => !o)}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setIsOpen((o) => !o)}
        className="group relative flex items-center gap-3 py-3 pl-4 pr-3 cursor-pointer select-none hover:bg-surface-raised transition-[background-color] transition-base"
        aria-expanded={isOpen}
      >
        {/* Left color bar — uses the same color as the schedule block */}
        <span
          aria-hidden
          className="absolute left-0 inset-y-2 w-[3px] rounded-full transition-[opacity] transition-base opacity-60 group-hover:opacity-100"
          style={{ backgroundColor: borderColor }}
        />

        {/* Checkbox — stop propagation so it doesn't toggle accordion */}
        <span onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={allSelected}
            indeterminate={isIndeterminate}
            onChange={handleHeaderCheckboxChange}
            ariaLabel={subject.code}
            size="sm"
          />
        </span>

        {/* Subject info */}
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-primary leading-snug truncate font-mono tracking-wide">
            {subject.code}
          </span>
        </div>

        {/* Selected badge */}
        <span className={`shrink-0 text-[11px] font-medium px-1.5 py-0.5 rounded-sm leading-none ${badgeClass}`}>
          {badgeLabel}
        </span>

        {/* Group dots — a quick visual summary of selection state */}
        <div className="hidden sm:flex items-center gap-[3px] shrink-0" aria-hidden>
          {subject.groups.map((g) => (
            <span
              key={g.id}
              className={[
                'size-1.5 rounded-full transition-[background-color] transition-fast',
                localSelection.has(g.id) ? 'bg-accent' : 'bg-border-strong/40',
              ].join(' ')}
            />
          ))}
        </div>

        {/* Chevron */}
        <ChevronDown
          size={13}
          aria-hidden
          className={`text-tertiary shrink-0 transition-[transform] transition-smooth ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </div>

      {/* ── Expandable groups — CSS grid animation, zero JS ───────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateRows: isOpen ? '1fr' : '0fr',
          transition: 'grid-template-rows var(--transition-smooth) ease-in-out',
        }}
      >
        <div className="overflow-hidden">
          <div className="pb-2 pl-[52px] pr-3">
            {subject.groups.map((group) => (
              <GroupItem
                key={group.id}
                group={group}
                checked={localSelection.has(group.id)}
                onChange={() => onToggle(group.id)}
                accentColor={borderColor}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

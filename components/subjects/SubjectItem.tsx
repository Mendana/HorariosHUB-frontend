'use client';

import { useState, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { CatalogSubject } from '@/lib/types/subjects';
import { GroupItem } from './GroupItem';
import { Checkbox } from '@/components/ui/Checkbox';

interface SubjectItemProps {
  subject: CatalogSubject;
  localSelection: Set<string>;
  onToggle: (groupId: string) => void;
}

export function SubjectItem({ subject, localSelection, onToggle }: SubjectItemProps) {
  const t = useTranslations('mySubjects');
  const [isOpen, setIsOpen] = useState(false);

  const total = subject.groups.length;
  const selectedCount = subject.groups.filter((g) => localSelection.has(g.id)).length;
  const allSelected = selectedCount === total;
  const isIndeterminate = selectedCount > 0 && !allSelected;

  // Toggles all groups in this subject without consuming a React mouse event.
  // Wrapped in useCallback so GroupItem renders are stable.
  const handleHeaderCheckboxChange = useCallback(() => {
    if (allSelected) {
      subject.groups.forEach((g) => {
        if (localSelection.has(g.id)) onToggle(g.id);
      });
    } else {
      subject.groups.forEach((g) => {
        if (!localSelection.has(g.id)) onToggle(g.id);
      });
    }
  }, [allSelected, subject.groups, localSelection, onToggle]);

  return (
    <div>
      {/* Header row */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen((o) => !o)}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setIsOpen((o) => !o)}
        className="flex items-center gap-3 py-3 px-1 cursor-pointer hover:bg-surface-raised transition-colors select-none"
      >
        {/*
         * Stop propagation here so a click on the checkbox doesn't also
         * toggle the accordion. The Checkbox itself is a <label> element
         * wrapping a native input, so we intercept at this span level.
         */}
        <span onClick={(e) => e.stopPropagation()}>
          <Checkbox
            checked={allSelected}
            indeterminate={isIndeterminate}
            onChange={handleHeaderCheckboxChange}
            ariaLabel={subject.name}
          />
        </span>

        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-primary">{subject.name}</span>
          <span className="ml-2 text-xs text-tertiary">{subject.code}</span>
        </div>

        <span className="text-xs text-secondary shrink-0">
          {t('groupsSelected', { selected: selectedCount, total })}
        </span>

        <ChevronDown
          size={14}
          aria-hidden
          className={`text-tertiary shrink-0 transition-transform duration-150 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </div>

      {/* Expandable groups — smooth CSS grid animation, no JS */}
      <div
        style={{
          display: 'grid',
          gridTemplateRows: isOpen ? '1fr' : '0fr',
          transition: 'grid-template-rows 200ms ease',
        }}
      >
        <div className="overflow-hidden">
          <div className="pb-1 pl-7">
            {subject.groups.map((group) => (
              <GroupItem
                key={group.id}
                group={group}
                checked={localSelection.has(group.id)}
                onChange={() => onToggle(group.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

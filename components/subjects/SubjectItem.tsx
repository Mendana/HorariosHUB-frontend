'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { CatalogSubject } from '@/lib/types/subjects';
import { GroupItem } from './GroupItem';

interface SubjectItemProps {
  subject: CatalogSubject;
  localSelection: Set<string>;
  onToggle: (groupId: string) => void;
}

export function SubjectItem({ subject, localSelection, onToggle }: SubjectItemProps) {
  const t = useTranslations('mySubjects');
  const [isOpen, setIsOpen] = useState(false);
  const headerCheckboxRef = useRef<HTMLInputElement>(null);

  const total = subject.groups.length;
  const selectedCount = subject.groups.filter((g) => localSelection.has(g.id)).length;
  const allSelected = selectedCount === total;
  const isIndeterminate = selectedCount > 0 && !allSelected;

  // indeterminate cannot be set as a React prop — needs direct DOM access
  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = isIndeterminate;
    }
  }, [isIndeterminate]);

  const handleHeaderCheckbox = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (allSelected) {
        subject.groups.forEach((g) => {
          if (localSelection.has(g.id)) onToggle(g.id);
        });
      } else {
        subject.groups.forEach((g) => {
          if (!localSelection.has(g.id)) onToggle(g.id);
        });
      }
    },
    [allSelected, subject.groups, localSelection, onToggle],
  );

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
        <input
          ref={headerCheckboxRef}
          type="checkbox"
          checked={allSelected}
          onChange={() => {/* controlled via onClick below */}}
          onClick={handleHeaderCheckbox}
          className="h-4 w-4 shrink-0 cursor-pointer rounded-sm"
          style={{ accentColor: 'var(--accent)' }}
          aria-label={subject.name}
        />

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

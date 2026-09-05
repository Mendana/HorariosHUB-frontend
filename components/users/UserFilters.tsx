'use client';

import { useTranslations } from 'next-intl';
import { Search, X } from 'lucide-react';
import { INPUT_FIELD_CLS } from '@/components/ui/Input';
import type { UserRole } from '@/lib/types/users';

interface UserFiltersProps {
  search: string;
  role: string;
  total: number;
  hasActiveFilters: boolean;
  onSearchChange: (v: string) => void;
  onRoleChange: (v: string) => void;
  onClear: () => void;
}

const ROLE_OPTIONS: { value: string; labelKey: string }[] = [
  { value: '',         labelKey: 'filterRoleAll' },
  { value: 'admin',    labelKey: 'filterRoleAdmin' },
  { value: 'professor', labelKey: 'filterRoleProfessor' },
  { value: 'student',  labelKey: 'filterRoleUser' },
];

const ACTIVE_ROLE_CLS: Record<UserRole | '', string> = {
  '':        'bg-accent-subtle text-accent border-accent/30',
  admin:     'bg-accent-subtle text-accent border-accent/30',
  professor: 'bg-warning-subtle text-warning border-warning/30',
  student:   'bg-surface-raised text-primary border-strong/40',
};

export function UserFilters({
  search, role, total, hasActiveFilters,
  onSearchChange, onRoleChange, onClear,
}: UserFiltersProps) {
  const t = useTranslations('users');

  return (
    <div className="mb-5">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {/* Search */}
        <div className="relative">
          <Search
            size={14}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-tertiary pointer-events-none"
            aria-hidden
          />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('filterSearchPlaceholder')}
            className={`${INPUT_FIELD_CLS} h-8 pl-8 pr-3 text-sm w-60`}
          />
        </div>

        {/* Role filter pills */}
        <div className="flex items-center gap-1">
          {ROLE_OPTIONS.map((opt) => {
            const isActive = role === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onRoleChange(opt.value)}
                className={[
                  'h-8 px-3 text-xs font-medium rounded-sm border transition-[background-color,color,border-color] duration-150',
                  isActive
                    ? ACTIVE_ROLE_CLS[opt.value as UserRole | '']
                    : 'border-subtle text-secondary hover:text-primary hover:border-strong/60',
                ].join(' ')}
              >
                {t(opt.labelKey)}
              </button>
            );
          })}
        </div>

        {/* Clear */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1.5 h-8 px-3 text-xs text-secondary border border-subtle rounded-sm hover:text-primary hover:border-strong transition-colors"
          >
            <X size={13} aria-hidden />
            {t('filterClear')}
          </button>
        )}
      </div>

      {/* Result count */}
      <p className="text-xs text-tertiary tabular-nums">
        {total === 1 ? t('countFoundOne') : t('countFoundMany', { count: total })}
      </p>
    </div>
  );
}

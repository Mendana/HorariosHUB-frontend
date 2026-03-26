'use client';

import { useTranslations } from 'next-intl';
import { Search, X } from 'lucide-react';
import { INPUT_FIELD_CLS } from '@/components/ui/Input';

interface UserFiltersProps {
  search: string;
  role: string;
  total: number;
  hasActiveFilters: boolean;
  onSearchChange: (v: string) => void;
  onRoleChange: (v: string) => void;
  onClear: () => void;
}

export function UserFilters({
  search, role, total, hasActiveFilters,
  onSearchChange, onRoleChange, onClear,
}: UserFiltersProps) {
  const t = useTranslations('users');

  const roleOptions = [
    { value: '',          label: t('filterRoleAll') },
    { value: 'admin',     label: t('filterRoleAdmin') },
    { value: 'professor', label: t('filterRoleProfessor') },
    { value: 'user',      label: t('filterRoleUser') },
  ];

  return (
    <div className="mb-4">
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
            className={`${INPUT_FIELD_CLS} h-9 pl-8 pr-3 text-sm w-64`}
          />
        </div>

        {/* Role pills */}
        <div className="flex items-center gap-1">
          {roleOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onRoleChange(opt.value)}
              className={`h-9 px-3 text-sm rounded-sm border transition-colors ${
                role === opt.value
                  ? 'bg-accent-subtle border-accent text-accent font-medium'
                  : 'border-subtle text-secondary hover:text-primary hover:border-strong'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Clear */}
        {hasActiveFilters && (
          <button
            onClick={onClear}
            className="inline-flex items-center gap-1.5 h-9 px-3 text-sm text-secondary border border-subtle rounded-sm hover:text-primary hover:border-strong transition-colors"
          >
            <X size={14} aria-hidden />
            {t('filterClear')}
          </button>
        )}
      </div>

      {/* Count */}
      <p className="text-xs text-tertiary">
        {total === 1 ? t('countFoundOne') : t('countFoundMany', { count: total })}
      </p>
    </div>
  );
}

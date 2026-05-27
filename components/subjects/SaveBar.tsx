'use client';

import { useTranslations } from 'next-intl';
import { Save, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface SaveBarProps {
  isDirty: boolean;
  changeCount: number;
  isSaving: boolean;
  onSave: () => void;
  onDiscard: () => void;
}

export function SaveBar({ isDirty, changeCount, isSaving, onSave, onDiscard }: SaveBarProps) {
  const t = useTranslations('mySubjects');

  const label =
    changeCount === 1
      ? t('unsavedChanges', { count: changeCount })
      : t('unsavedChangesMultiple', { count: changeCount });

  return (
    <div
      className={[
        'fixed bottom-0 inset-x-0 z-30',
        'transition-[transform,opacity] duration-200 ease-out',
        isDirty ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none',
      ].join(' ')}
      aria-hidden={!isDirty}
    >
      {/* Gradient fade above the bar so content doesn't hard-cut */}
      <div className="h-8 bg-gradient-to-t from-surface-base/80 to-transparent pointer-events-none" />

      <div className="bg-surface-raised border-t border-subtle shadow-md">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-4">
          {/* Change count */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="size-2 rounded-full bg-warning shrink-0 animate-pulse" aria-hidden />
            <p className="text-sm text-secondary truncate">{label}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onDiscard}
              disabled={isSaving}
              aria-label={t('discard')}
              className="h-8 w-8 flex items-center justify-center rounded-sm text-tertiary hover:text-primary hover:bg-surface-sunken border border-subtle disabled:opacity-40 transition-[background-color,color] transition-fast"
            >
              <X size={14} aria-hidden />
            </button>
            <Button variant="primary" size="sm" onClick={onSave} loading={isSaving} iconLeft={!isSaving ? Save : undefined}>
              {t('saveChanges')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

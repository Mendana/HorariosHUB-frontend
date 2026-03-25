'use client';

import { useTranslations } from 'next-intl';
import { Spinner } from '@/components/ui/Spinner';

interface SaveBarProps {
  isDirty: boolean;
  changeCount: number;
  isSaving: boolean;
  onSave: () => void;
  onDiscard: () => void;
}

export function SaveBar({ isDirty, changeCount, isSaving, onSave, onDiscard }: SaveBarProps) {
  const t = useTranslations('mySubjects');

  if (!isDirty) return null;

  const label =
    changeCount === 1
      ? t('unsavedChanges', { count: changeCount })
      : t('unsavedChangesMultiple', { count: changeCount });

  return (
    <div className="fixed bottom-0 inset-x-0 z-30 bg-surface-raised border-t border-subtle">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-4">
        <p className="text-sm text-secondary">{label}</p>

        <div className="flex items-center gap-2">
          <button
            onClick={onDiscard}
            disabled={isSaving}
            className="px-3 py-1.5 text-sm border border-subtle rounded-sm text-secondary hover:text-primary hover:border-strong transition-colors disabled:opacity-50"
          >
            {t('discard')}
          </button>

          <button
            onClick={onSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-accent text-white rounded-sm hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {isSaving && <Spinner size={14} />}
            {t('saveChanges')}
          </button>
        </div>
      </div>
    </div>
  );
}

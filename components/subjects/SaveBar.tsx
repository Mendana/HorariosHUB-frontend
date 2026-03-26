'use client';

import { useTranslations } from 'next-intl';
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
          <Button variant="secondary" size="sm" onClick={onDiscard} disabled={isSaving}>
            {t('discard')}
          </Button>
          <Button variant="primary" size="sm" onClick={onSave} loading={isSaving}>
            {t('saveChanges')}
          </Button>
        </div>
      </div>
    </div>
  );
}

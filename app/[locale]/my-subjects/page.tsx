'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import { useSubjects } from '@/lib/hooks/useSubjects';
import { SubjectCatalog } from '@/components/subjects/SubjectCatalog';
import { AutoSelectButton } from '@/components/subjects/AutoSelectButton';
import { SaveBar } from '@/components/subjects/SaveBar';

export default function MySubjectsPage() {
  const t = useTranslations('mySubjects');
  const { user } = useAuth();
  const router = useRouter();

  // Auth guard — redirect visitors to login
  useEffect(() => {
    if (user === null) {
      router.push('/auth/login');
    }
  }, [user, router]);

  const { subjects, isLoading, error, reload, saveSelection, autoSelect } = useSubjects();

  // Local selection state — initialized once from catalog data
  const [localSelection, setLocalSelection] = useState<Set<string>>(new Set());
  const [initialSelection, setInitialSelection] = useState<Set<string>>(new Set());
  const selectionInitialized = useRef(false);

  useEffect(() => {
    if (!isLoading && !selectionInitialized.current) {
      const ids = new Set(
        subjects.flatMap((s) => s.groups.filter((g) => g.selected).map((g) => g.id)),
      );
      setLocalSelection(ids);
      setInitialSelection(new Set(ids));
      selectionInitialized.current = true;
    }
  }, [subjects, isLoading]);

  // Dirty state — count added + removed groups compared to server state
  const isDirty = useMemo(() => {
    if (localSelection.size !== initialSelection.size) return true;
    for (const id of localSelection) {
      if (!initialSelection.has(id)) return true;
    }
    return false;
  }, [localSelection, initialSelection]);

  const changeCount = useMemo(() => {
    let count = 0;
    for (const id of localSelection) if (!initialSelection.has(id)) count++;
    for (const id of initialSelection) if (!localSelection.has(id)) count++;
    return count;
  }, [localSelection, initialSelection]);

  const handleToggle = useCallback((groupId: string) => {
    setLocalSelection((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  }, []);

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await saveSelection([...localSelection]);
      // Update baseline so dirty state resets
      setInitialSelection(new Set(localSelection));
    } finally {
      setIsSaving(false);
    }
  }, [localSelection, saveSelection]);

  const handleDiscard = useCallback(() => {
    setLocalSelection(new Set(initialSelection));
  }, [initialSelection]);

  // After auto-select: apply returned group IDs to local selection
  const handleAutoSelectComplete = useCallback((groupIds: string[]) => {
    setLocalSelection(new Set(groupIds));
  }, []);

  // Don't render while redirecting
  if (user === null) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 pb-24">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 py-4">
        <h1 className="text-xl font-semibold text-primary">{t('title')}</h1>
        <AutoSelectButton
          onAutoSelect={autoSelect}
          onComplete={handleAutoSelectComplete}
        />
      </div>

      {/* Catalog */}
      <SubjectCatalog
        subjects={subjects}
        isLoading={isLoading}
        error={error}
        onRetry={reload}
        localSelection={localSelection}
        onToggle={handleToggle}
      />

      {/* Fixed save bar — only visible when there are unsaved changes */}
      <SaveBar
        isDirty={isDirty}
        changeCount={changeCount}
        isSaving={isSaving}
        onSave={handleSave}
        onDiscard={handleDiscard}
      />
    </div>
  );
}

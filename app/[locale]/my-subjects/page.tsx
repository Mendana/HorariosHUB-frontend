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
      setInitialSelection(new Set(localSelection));
    } finally {
      setIsSaving(false);
    }
  }, [localSelection, saveSelection]);

  const handleDiscard = useCallback(() => {
    setLocalSelection(new Set(initialSelection));
  }, [initialSelection]);

  const handleAutoSelectComplete = useCallback((groupIds: string[]) => {
    setLocalSelection(new Set(groupIds));
  }, []);

  if (user === null) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 pb-28">
      {/* ── Page header ────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 pt-6 pb-5 border-b border-subtle mb-5">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-primary leading-tight">
            {t('title')}
          </h1>
          <p className="mt-1 text-sm text-secondary leading-snug max-w-xl">
            {t('subtitle')}
          </p>
        </div>

        <AutoSelectButton
          onAutoSelect={autoSelect}
          onComplete={handleAutoSelectComplete}
        />
      </div>

      {/* ── Catalog ─────────────────────────────────────────────────────────── */}
      <SubjectCatalog
        subjects={subjects}
        isLoading={isLoading}
        error={error}
        onRetry={reload}
        localSelection={localSelection}
        onToggle={handleToggle}
      />

      {/* ── Fixed save bar ───────────────────────────────────────────────────── */}
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

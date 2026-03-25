'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Class, ClassInput } from '@/lib/types/classes';
import { MOCK_CLASSES } from '@/lib/mock/classes';

// ── Real implementation (TanStack Query) ──────────────────────────────────────
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { apiFetch } from '@/lib/apiFetch';
//
// export function useClasses() {
//   const qc = useQueryClient();
//   const { data, isLoading, error } = useQuery({
//     queryKey: ['classes'],
//     queryFn: () => apiFetch<Class[]>('/api/classes'),
//   });
//   const createMutation = useMutation({
//     mutationFn: (input: ClassInput) =>
//       apiFetch<Class>('/api/classes', { method: 'POST', body: input }),
//     onSuccess: () => qc.invalidateQueries({ queryKey: ['classes'] }),
//   });
//   const updateMutation = useMutation({
//     mutationFn: ({ id, ...data }: { id: string } & Partial<ClassInput>) =>
//       apiFetch<Class>(`/api/classes/${id}`, { method: 'PATCH', body: data }),
//     onSuccess: () => qc.invalidateQueries({ queryKey: ['classes'] }),
//   });
//   const deleteMutation = useMutation({
//     mutationFn: (id: string) =>
//       apiFetch(`/api/classes/${id}`, { method: 'DELETE' }),
//     onSuccess: () => qc.invalidateQueries({ queryKey: ['classes'] }),
//   });
//   return {
//     classes: data ?? [],
//     isLoading,
//     error: error?.message ?? null,
//     createClass: (input: ClassInput) => createMutation.mutateAsync(input),
//     updateClass: (id: string, data: Partial<ClassInput>) => updateMutation.mutateAsync({ id, ...data }),
//     deleteClass: (id: string) => deleteMutation.mutateAsync(id),
//   };
// }
// ─────────────────────────────────────────────────────────────────────────────

let idCounter = MOCK_CLASSES.length + 1;

function calcEndTime(startTime: string, durationMinutes: number): string {
  const [h, m] = startTime.split(':').map(Number);
  const total = h * 60 + m + durationMinutes;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

export interface UseClassesResult {
  classes: Class[];
  isLoading: boolean;
  error: string | null;
  createClass: (input: ClassInput) => Promise<Class>;
  updateClass: (id: string, input: Partial<ClassInput>) => Promise<Class>;
  deleteClass: (id: string) => Promise<void>;
}

export function useClasses(): UseClassesResult {
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const t = setTimeout(() => {
      setClasses([...MOCK_CLASSES]);
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(t);
  }, []);

  const createClass = useCallback(async (input: ClassInput): Promise<Class> => {
    await new Promise((res) => setTimeout(res, 600));
    const newClass: Class = {
      ...input,
      id: `cls-new-${idCounter++}`,
      endTime: calcEndTime(input.startTime, input.durationMinutes),
    };
    setClasses((prev) => [...prev, newClass]);
    return newClass;
  }, []);

  const updateClass = useCallback(
    async (id: string, input: Partial<ClassInput>): Promise<Class> => {
      await new Promise((res) => setTimeout(res, 600));
      let updated!: Class;
      setClasses((prev) =>
        prev.map((c) => {
          if (c.id !== id) return c;
          const merged: Class = { ...c, ...input };
          if (input.startTime || input.durationMinutes) {
            merged.endTime = calcEndTime(
              input.startTime ?? c.startTime,
              input.durationMinutes ?? c.durationMinutes,
            );
          }
          updated = merged;
          return merged;
        }),
      );
      return updated;
    },
    [],
  );

  const deleteClass = useCallback(async (id: string): Promise<void> => {
    await new Promise((res) => setTimeout(res, 400));
    setClasses((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // Sort by date then startTime
  const sorted = [...classes].sort((a, b) => {
    const da = a.date.year * 10000 + a.date.month * 100 + a.date.day;
    const db = b.date.year * 10000 + b.date.month * 100 + b.date.day;
    if (da !== db) return da - db;
    return a.startTime.localeCompare(b.startTime);
  });

  return { classes: sorted, isLoading, error, createClass, updateClass, deleteClass };
}

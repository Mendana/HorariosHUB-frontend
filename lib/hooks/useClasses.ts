"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Class, ClassInput, ClassesFilter } from "../types/classes";
import { useToast } from "./useToast";
import { fetchClasses, createClass, deleteClass, updateClass } from "../api/classes";
import { getErrorMessage } from "../errors";

export type { ClassesFilter };

export interface UseClassesResult {
  classes: Class[];
  total: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  createClass: (input: ClassInput) => Promise<Class>;
  updateClass: (id: string, input: Partial<ClassInput>) => Promise<Class>;
  deleteClass: (id: string) => Promise<void>;
}

export function useClasses(filter: ClassesFilter = {}, enabled: boolean = true): UseClassesResult {
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['classes', filter],
    queryFn: () => fetchClasses(filter),
    staleTime: 2 * 60 * 1000,
    enabled,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['classes'] });

  const createMutation = useMutation({
    mutationFn: (input: ClassInput) => createClass(input),
    onSuccess: invalidate,
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...input }: { id: string } & Partial<ClassInput>) => updateClass(id, input),
    onSuccess: invalidate,
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteClass(id),
    onSuccess: invalidate,
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return {
    classes: data?.classes ?? [],
    total: data?.total ?? 0,
    isLoading,
    error: error ? getErrorMessage(error) : null,
    refetch: () => { void refetch(); },
    createClass: (input) => createMutation.mutateAsync(input),
    updateClass: (id, input) => updateMutation.mutateAsync({ id, ...input }),
    deleteClass: (id) => deleteMutation.mutateAsync(id),
  };
}

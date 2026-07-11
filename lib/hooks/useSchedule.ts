'use client';

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Subject } from "../types/schedule";
import { fetchSchedule } from "../api/schedule";
import { createContext, useCallback } from "react";
import { getErrorMessage } from "../errors";

export const ScheduleRefreshContext = createContext<() => void>(() => {});

interface UseScheduleResult {
  subjects: Subject[];
  isLoading: boolean;
  error: string | null;
  refreshSchedule: () => void; 
}

export function useSchedule(identifier: string | null, start?: string): UseScheduleResult {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['schedule', identifier, start],
    queryFn: async () => fetchSchedule(identifier!, start),
    enabled: !!identifier,
    staleTime: 5 * 60 * 1000,
  });

  const refreshSchedule = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['schedule', identifier, start] });
  }, [queryClient, identifier, start]);

  return {
    subjects: data?.subjects ?? [],
    isLoading,
    error: error ? getErrorMessage(error) : null,
    refreshSchedule,
  }
}
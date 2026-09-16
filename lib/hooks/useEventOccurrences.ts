'use client';

import { useCallback, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchEventOccurrences } from '../api/events';
import { filterOccurrencesForSchedule } from '../utils/scheduleHelpers';
import type { Subject } from '../types/schedule';
import type { DisplayEvent } from '../types/events';

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export interface UseEventOccurrencesResult {
  events: DisplayEvent[];
  isLoading: boolean;
  eventsVisible: boolean;
  toggleVisibility: () => void;
}

/**
 * Fetches event occurrences for the visible date range and cross-references
 * them against the currently loaded schedule's subjects/groups — the backend
 * returns the full catalog in range, unfiltered by user (same pattern as
 * GET /classes). A failed fetch degrades to "no events" rather than blocking
 * the primary schedule view, since events are a supplementary overlay.
 */
export function useEventOccurrences(
  from: string,
  to: string,
  subjects: Subject[],
  enabled: boolean,
): UseEventOccurrencesResult {
  const [eventsVisible, setEventsVisible] = useState<boolean>(true);

  useEffect(() => {
    setEventsVisible(readStorage<boolean>('eventsVisible', true));
  }, []);

  const toggleVisibility = useCallback(() => {
    setEventsVisible((prev) => {
      const next = !prev;
      localStorage.setItem('eventsVisible', JSON.stringify(next));
      return next;
    });
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ['event-occurrences', from, to],
    queryFn: () => fetchEventOccurrences({ from, to }),
    enabled,
    staleTime: 2 * 60 * 1000,
  });

  const events = data ? filterOccurrencesForSchedule(data.occurrences, subjects) : [];

  return { events, isLoading, eventsVisible, toggleVisibility };
}

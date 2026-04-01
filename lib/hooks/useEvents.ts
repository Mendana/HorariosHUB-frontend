'use client';

import { useState, useEffect, useCallback } from 'react';
import { MOCK_EVENTS } from '@/lib/mock/events';
import type { UserEvent, NewEventData } from '@/lib/types/events';

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

let idCounter = MOCK_EVENTS.length;
function nextId(): string {
  idCounter += 1;
  return `ev-${String(idCounter).padStart(3, '0')}`;
}

export function useEvents(): {
  events: UserEvent[];
  isLoading: boolean;
  eventsVisible: boolean;
  toggleVisibility: () => void;
  createEvent: (data: NewEventData) => Promise<UserEvent>;
  updateEvent: (id: string, data: Partial<NewEventData>) => Promise<UserEvent>;
  deleteEvent: (id: string) => Promise<void>;
} {
  const [events, setEvents]   = useState<UserEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [eventsVisible, setEventsVisible] = useState<boolean>(true);

  // Simulate GET /api/events
  useEffect(() => {
    const timer = setTimeout(() => {
      setEvents([...MOCK_EVENTS]);
      setIsLoading(false);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  // Rehydrate visibility preference from localStorage
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

  const createEvent = useCallback((data: NewEventData): Promise<UserEvent> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const event: UserEvent = { ...data, id: nextId() };
        setEvents((prev) => [...prev, event]);
        resolve(event);
      }, 400);
    });
  }, []);

  const updateEvent = useCallback((id: string, data: Partial<NewEventData>): Promise<UserEvent> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        setEvents((prev) => {
          const idx = prev.findIndex((e) => e.id === id);
          if (idx === -1) { reject(new Error(`Event ${id} not found`)); return prev; }
          const updated = { ...prev[idx], ...data };
          const next = [...prev];
          next[idx] = updated;
          resolve(updated);
          return next;
        });
      }, 400);
    });
  }, []);

  const deleteEvent = useCallback((id: string): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        setEvents((prev) => prev.filter((e) => e.id !== id));
        resolve();
      }, 400);
    });
  }, []);

  return { events, isLoading, eventsVisible, toggleVisibility, createEvent, updateEvent, deleteEvent };

  /* ── Fetch real (uncomment when backend is ready) ─────────────────────────

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => apiFetch<UserEvent[]>('/api/events'),
  });

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

  const createMutation = useMutation({
    mutationFn: (data: NewEventData) =>
      apiFetch<UserEvent>('/api/events', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<NewEventData> }) =>
      apiFetch<UserEvent>(`/api/events/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/events/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['events'] }),
  });

  return {
    events: data ?? [],
    isLoading,
    eventsVisible,
    toggleVisibility,
    createEvent: (data) => createMutation.mutateAsync(data),
    updateEvent: (id, data) => updateMutation.mutateAsync({ id, data }),
    deleteEvent: (id) => deleteMutation.mutateAsync(id),
  };

  ─────────────────────────────────────────────────────────────────────────── */
}

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { EventItem, EventInput, EventPatchInput } from '../types/events';
import { fetchEvents, createEvent, updateEvent, deleteEvent, type FetchEventsParams } from '../api/events';
import { getErrorMessage } from '../errors';
import { useToast } from './useToast';

export interface UseEventsResult {
  events: EventItem[];
  total: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
  createEvent: (input: EventInput) => Promise<EventItem>;
  updateEvent: (id: string, input: EventPatchInput) => Promise<EventItem>;
  deleteEvent: (id: string) => Promise<void>;
}

export function useEvents(params: FetchEventsParams = {}, enabled: boolean = true): UseEventsResult {
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['events', params],
    queryFn: () => fetchEvents(params),
    staleTime: 2 * 60 * 1000,
    enabled,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['events'] });
    // Occurrences are derived from event definitions — a mutation here
    // changes what the schedule grid should render too.
    qc.invalidateQueries({ queryKey: ['event-occurrences'] });
  };

  const createMutation = useMutation({
    mutationFn: (input: EventInput) => createEvent(input),
    onSuccess: invalidate,
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: EventPatchInput }) => updateEvent(id, input),
    onSuccess: invalidate,
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteEvent(id),
    onSuccess: invalidate,
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return {
    events: data?.events ?? [],
    total: data?.total ?? 0,
    isLoading,
    error: error ? getErrorMessage(error) : null,
    refetch: () => { void refetch(); },
    createEvent: (input) => createMutation.mutateAsync(input),
    updateEvent: (id, input) => updateMutation.mutateAsync({ id, input }),
    deleteEvent: (id) => deleteMutation.mutateAsync(id).then(() => undefined),
  };
}

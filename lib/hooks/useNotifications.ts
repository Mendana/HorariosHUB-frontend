'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from '../api/notifications';
import type { Notification, PaginatedNotifications } from '../types/notifications';

const MAX_STORED = 50;
const MAX_DISPLAYED = 20;
const POLL_INTERVAL_MS = 60_000;

export function useNotifications(): {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismiss: (id: string) => void;
} {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => fetchNotifications({ limit: MAX_STORED, page: 1 }),
  });

  // Polls every 60s for unread count; if changed → refetch full list
  const { data: countData } = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: fetchUnreadCount,
    refetchInterval: POLL_INTERVAL_MS,
    select: (d) => d.unreadCount,
  });

  const prevCountRef = useRef<number | null>(null);
  useEffect(() => {
    if (countData === undefined) return;
    if (prevCountRef.current !== null && prevCountRef.current !== countData) {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
    prevCountRef.current = countData;
  }, [countData, queryClient]);

  const markReadMutation = useMutation({
    mutationFn: markNotificationRead,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const prev = queryClient.getQueryData<PaginatedNotifications>(['notifications']);
      queryClient.setQueryData<PaginatedNotifications>(['notifications'], (old) =>
        old
          ? { ...old, data: old.data.map((n) => (n.id === id ? { ...n, read: true } : n)) }
          : old,
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['notifications'], ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const prev = queryClient.getQueryData<PaginatedNotifications>(['notifications']);
      queryClient.setQueryData<PaginatedNotifications>(['notifications'], (old) =>
        old ? { ...old, data: old.data.map((n) => ({ ...n, read: true })) } : old,
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['notifications'], ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNotification,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['notifications'] });
      const prev = queryClient.getQueryData<PaginatedNotifications>(['notifications']);
      queryClient.setQueryData<PaginatedNotifications>(['notifications'], (old) =>
        old ? { ...old, data: old.data.filter((n) => n.id !== id) } : old,
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['notifications'], ctx.prev);
    },
  });

  const allItems = data?.data ?? [];
  const unreadCount = countData ?? allItems.filter((n) => !n.read).length;

  const markAsRead = useCallback(
    (id: string) => { markReadMutation.mutate(id); },
    [markReadMutation],
  );
  const markAllAsRead = useCallback(
    () => { markAllMutation.mutate(); },
    [markAllMutation],
  );
  const dismiss = useCallback(
    (id: string) => { deleteMutation.mutate(id); },
    [deleteMutation],
  );

  return {
    notifications: allItems.slice(0, MAX_DISPLAYED),
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    dismiss,
  };
}

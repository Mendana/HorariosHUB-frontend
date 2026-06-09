 
'use client';

import { useState, useEffect, useCallback } from 'react';
import { MOCK_NOTIFICATIONS } from '@/lib/mock/notifications';
import type { Notification } from '@/lib/types/notifications';
import { MOCKS } from '@/lib/config/mocks';

const MAX_STORED = 50;
const MAX_DISPLAYED = 20;

export function useNotifications(): {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismiss: (id: string) => void;
} {
  if (MOCKS.notifications) {
    const [all, setAll] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Simulate GET /api/notifications
    useEffect(() => {
      const timer = setTimeout(() => {
        setAll(MOCK_NOTIFICATIONS.slice(0, MAX_STORED));
        setIsLoading(false);
      }, 200);
      return () => clearTimeout(timer);
    }, []);

    const markAsRead = useCallback((id: string) => {
      setAll((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    }, []);

    const markAllAsRead = useCallback(() => {
      setAll((prev) => prev.map((n) => ({ ...n, read: true })));
    }, []);

    const dismiss = useCallback((id: string) => {
      setAll((prev) => prev.filter((n) => n.id !== id));
    }, []);

    // Max 20 shown in dropdown; unread count from the full stored list
    const notifications = all.slice(0, MAX_DISPLAYED);
    const unreadCount = all.filter((n) => !n.read).length;

    return { notifications, unreadCount, isLoading, markAsRead, markAllAsRead, dismiss };
  }

  // ── Real implementation — descomentar cuando MOCKS.notifications = false ───
  // import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
  // import { apiFetch } from '@/lib/apiFetch';
  //
  // const queryClient = useQueryClient();
  // const { data, isLoading } = useQuery({
  //   queryKey: ['notifications'],
  //   queryFn: () => apiFetch<Notification[]>('/api/notifications?limit=50'),
  //   refetchInterval: 30_000, // poll every 30 s for new notifications
  // });
  //
  // const markAsReadMutation = useMutation({
  //   mutationFn: (id: string) =>
  //     apiFetch(`/api/notifications/${id}/read`, { method: 'PATCH' }),
  //   onMutate: async (id) => {
  //     await queryClient.cancelQueries({ queryKey: ['notifications'] });
  //     const previous = queryClient.getQueryData<Notification[]>(['notifications']);
  //     queryClient.setQueryData<Notification[]>(['notifications'], (old = []) =>
  //       old.map((n) => (n.id === id ? { ...n, read: true } : n)),
  //     );
  //     return { previous };
  //   },
  //   onError: (_err, _vars, ctx) => {
  //     if (ctx?.previous) queryClient.setQueryData(['notifications'], ctx.previous);
  //   },
  // });
  //
  // const dismissMutation = useMutation({
  //   mutationFn: (id: string) =>
  //     apiFetch(`/api/notifications/${id}`, { method: 'DELETE' }),
  //   onMutate: async (id) => {
  //     await queryClient.cancelQueries({ queryKey: ['notifications'] });
  //     const previous = queryClient.getQueryData<Notification[]>(['notifications']);
  //     queryClient.setQueryData<Notification[]>(['notifications'], (old = []) =>
  //       old.filter((n) => n.id !== id),
  //     );
  //     return { previous };
  //   },
  //   onError: (_err, _vars, ctx) => {
  //     if (ctx?.previous) queryClient.setQueryData(['notifications'], ctx.previous);
  //   },
  // });
  //
  // const storedAll = (data ?? []).slice(0, MAX_STORED);
  // return {
  //   notifications: storedAll.slice(0, MAX_DISPLAYED),
  //   unreadCount: storedAll.filter((n) => !n.read).length,
  //   isLoading,
  //   markAsRead: (id) => markAsReadMutation.mutate(id),
  //   markAllAsRead: () => storedAll.forEach((n) => !n.read && markAsReadMutation.mutate(n.id)),
  //   dismiss: (id) => dismissMutation.mutate(id),
  // };

  throw new Error('MOCKS.notifications is false pero la implementación real no está conectada. Ver docs/CONNECTING_BACKEND.md');
}

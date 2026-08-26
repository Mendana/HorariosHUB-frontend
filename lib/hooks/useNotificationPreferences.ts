'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchNotificationPreferences, updateNotificationPreferences } from '../api/notifications';
import type { NotificationPreferences } from '../types/notifications';

export function useNotificationPreferences(): {
  preferences: NotificationPreferences | null;
  isLoading: boolean;
  update: (prefs: Partial<NotificationPreferences>) => Promise<void>;
} {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: fetchNotificationPreferences,
    staleTime: 5 * 60 * 1000,
  });

  const mutation = useMutation({
    mutationFn: updateNotificationPreferences,
    onMutate: async (prefs) => {
      await queryClient.cancelQueries({ queryKey: ['notification-preferences'] });
      const prev = queryClient.getQueryData<NotificationPreferences>(['notification-preferences']);
      queryClient.setQueryData<NotificationPreferences>(
        ['notification-preferences'],
        (old) => (old ? { ...old, ...prefs } : old),
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(['notification-preferences'], ctx.prev);
    },
  });

  return {
    preferences: data ?? null,
    isLoading,
    update: (prefs) => mutation.mutateAsync(prefs).then(() => undefined),
  };
}

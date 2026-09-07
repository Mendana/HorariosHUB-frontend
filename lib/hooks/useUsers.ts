'use client';

import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/lib/hooks/useToast';
import { fetchUsers, changeUserRole, deleteUser as apiDeleteUser } from '@/lib/api/users';
import type { User, UserRole } from '@/lib/types/users';
import { getErrorMessage } from '@/lib/errors';

export function useUsers(enabled: boolean = true): {
  users: User[];
  isLoading: boolean;
  error: string | null;
  changeRole: (id: string, role: UserRole) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
} {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    staleTime: 2 * 60 * 1000,
    enabled,
  });

  const changeRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) => changeUserRole(id, role),
    onMutate: async ({ id, role }) => {
      await queryClient.cancelQueries({ queryKey: ['users'] });
      const previous = queryClient.getQueryData<User[]>(['users']);
      queryClient.setQueryData<User[]>(['users'], (old = []) =>
        old.map((u) => (u.id === id ? { ...u, role } : u)),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(['users'], context.previous);
      toast.error(getErrorMessage(_err));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiDeleteUser(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['users'] });
      const previous = queryClient.getQueryData<User[]>(['users']);
      queryClient.setQueryData<User[]>(['users'], (old = []) =>
        old.filter((u) => u.id !== id),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(['users'], context.previous);
      toast.error(getErrorMessage(_err));
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  const changeRole = useCallback(
    (id: string, role: UserRole) => changeRoleMutation.mutateAsync({ id, role }),
    [changeRoleMutation],
  );

  const deleteUser = useCallback(
    (id: string) => deleteMutation.mutateAsync(id),
    [deleteMutation],
  );

  return {
    users: data ?? [],
    isLoading,
    error: error ? getErrorMessage(error) : null,
    changeRole,
    deleteUser,
  };
}

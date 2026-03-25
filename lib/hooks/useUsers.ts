'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { MOCK_USERS } from '@/lib/mock/users';
import type { User, UserRole } from '@/lib/types/users';

export function useUsers(): {
  users: User[];
  isLoading: boolean;
  error: string | null;
  changeRole: (email: string, role: UserRole) => Promise<void>;
  deleteUser: (email: string) => Promise<void>;
} {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error] = useState<string | null>(null);

  // Simulate GET /api/users
  useEffect(() => {
    setIsLoading(true);
    const t = setTimeout(() => {
      setUsers([...MOCK_USERS]);
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(t);
  }, []);

  // Simulate PATCH /api/users/{email}/role
  const changeRole = useCallback(
    async (email: string, role: UserRole) => {
      if (email === currentUser?.email) {
        throw new Error('SELF_ROLE');
      }
      // Optimistic update
      setUsers((prev) => prev.map((u) => (u.email === email ? { ...u, role } : u)));
      await new Promise<void>((resolve) => setTimeout(resolve, 600));
    },
    [currentUser?.email],
  );

  // Simulate DELETE /api/users/{email}
  const deleteUser = useCallback(
    async (email: string) => {
      if (email === currentUser?.email) {
        throw new Error('SELF_DELETE');
      }
      // Optimistic update
      setUsers((prev) => prev.filter((u) => u.email !== email));
      await new Promise<void>((resolve) => setTimeout(resolve, 400));
    },
    [currentUser?.email],
  );

  return { users, isLoading, error, changeRole, deleteUser };

  /* ── TanStack Query (uncomment when backend is ready) ─────────────────────────

  const queryClient = useQueryClient();

  const { data, isLoading, error: queryError } = useQuery({
    queryKey: ['users'],
    queryFn: () => apiFetch<User[]>('/api/users'),
  });

  const changeRoleMutation = useMutation({
    mutationFn: ({ email, role }: { email: string; role: UserRole }) =>
      apiFetch<User>(`/api/users/${encodeURIComponent(email)}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      }),
    onMutate: async ({ email, role }) => {
      await queryClient.cancelQueries({ queryKey: ['users'] });
      const previous = queryClient.getQueryData<User[]>(['users']);
      queryClient.setQueryData<User[]>(['users'], (old = []) =>
        old.map((u) => (u.email === email ? { ...u, role } : u)),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(['users'], context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (email: string) =>
      apiFetch(`/api/users/${encodeURIComponent(email)}`, { method: 'DELETE' }),
    onMutate: async (email) => {
      await queryClient.cancelQueries({ queryKey: ['users'] });
      const previous = queryClient.getQueryData<User[]>(['users']);
      queryClient.setQueryData<User[]>(['users'], (old = []) =>
        old.filter((u) => u.email !== email),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(['users'], context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  return {
    users: data ?? [],
    isLoading,
    error: queryError ? 'Failed to load users' : null,
    changeRole: (email, role) => changeRoleMutation.mutateAsync({ email, role }),
    deleteUser: (email) => deleteMutation.mutateAsync(email),
  };

  ─────────────────────────────────────────────────────────────────────────── */
}

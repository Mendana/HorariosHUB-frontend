'use client';

import { authLogout } from "@/lib/api/auth";
import { apiFetch } from "@/lib/api/apiFetch";
import { isApiError } from "@/lib/errors";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@/i18n/navigation";
import { useCallback } from "react";

export type Role = 'student' | 'profesor' | 'admin';

export interface AuthUser {
  email: string;
  role: Role;
}

export function useAuth(): {
  user: AuthUser | null;
  isLoading: boolean;
  logout: () => Promise<void>;
} {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      try {
        return await apiFetch<AuthUser>('/auth/me');
      } catch (err) {
        if (isApiError(err) && err.status === 401) return null;
        throw err;
      }
    },
    retry: false,
    throwOnError: false,
    staleTime: 5 * 60 * 1000,
  });

  const logout = useCallback(async () => {
    await authLogout();
    queryClient.setQueryData(['me'], null);
    router.push('/auth/login');
  }, [queryClient, router]);

  return { user: data ?? null, isLoading, logout };
}
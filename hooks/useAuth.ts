'use client';

import { authLogout } from "@/lib/api/auth";
import { apiFetch } from "@/lib/api/apiFetch";
import { isApiError } from "@/lib/errors";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useCallback, useEffect } from "react";

export type Role = 'student' | 'profesor' | 'admin';

export interface AuthUser {
  email: string;
  role: Role;
}

export function useAuth(): {
  user: AuthUser | null;
  logout: () => Promise<void>;
} {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const { data } = useQuery({
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

  useEffect(() => {
    if (data === null && !pathname.startsWith('/auth/')) router.push('/auth/login');
  }, [data, router, pathname]);

  const logout = useCallback(async () => {
    await authLogout();
    queryClient.setQueryData(['me'], null);
    router.push('/auth/login');
  }, [queryClient, router]);

  return { user: data ?? null, logout };
}
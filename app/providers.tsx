'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { isApiError } from '@/lib/errors';

const EasterEgg = dynamic(
  () => import('@/components/easter-egg/EasterEgg').then((m) => m.EasterEgg),
  { ssr: false },
);

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 60s antes de que los datos se consideren stale
            staleTime: 60 * 1000,
            // No reintentar en desarrollo para ver errores rápido.
            // Nunca reintentar 401/403: son errores de sesión/permisos, no transitorios.
            retry: (failureCount, error) => {
              if (isApiError(error) && (error.status === 401 || error.status === 403)) return false;
              if (process.env.NODE_ENV !== 'production') return false;
              return failureCount < 3;
            },
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <EasterEgg />
    </QueryClientProvider>
  );
}

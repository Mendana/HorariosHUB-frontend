'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import dynamic from 'next/dynamic';

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
            // No reintentar en desarrollo para ver errores rápido
            retry: process.env.NODE_ENV === 'production' ? 3 : 0,
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

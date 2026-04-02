'use client';

import { useToastContext } from '@/components/ui/ToastProvider';

interface ToastActions {
  error:   (message: string) => void;
  success: (message: string) => void;
  info:    (message: string) => void;
}

export function useToast(): { toast: ToastActions } {
  const { add } = useToastContext();
  return {
    toast: {
      error:   (message) => add('error',   message),
      success: (message) => add('success', message),
      info:    (message) => add('info',    message),
    },
  };
}

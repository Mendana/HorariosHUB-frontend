'use client';

import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { Toast, type ToastItem, type ToastType } from './Toast';

const MAX_TOASTS = 3;

interface ToastContextValue {
  add: (type: ToastType, message: string) => void;
}

export const ToastContext = createContext<ToastContextValue>({ add: () => {} });

export function useToastContext(): ToastContextValue {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const add = useCallback((type: ToastType, message: string) => {
    const id = `toast-${++counter.current}`;
    setToasts((prev) => {
      const next: ToastItem[] = [...prev, { id, type, message }];
      // Keep only the most recent MAX_TOASTS
      return next.length > MAX_TOASTS ? next.slice(next.length - MAX_TOASTS) : next;
    });
  }, []);

  return (
    <ToastContext.Provider value={{ add }}>
      {children}
      {/* Toast container — fixed bottom-right, pointer-events-none so clicks pass through */}
      <div
        aria-label="Notificaciones"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
      >
        {toasts.map((item) => (
          <Toast key={item.id} item={item} onRemove={remove} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

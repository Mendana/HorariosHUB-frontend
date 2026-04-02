'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

export type ToastType = 'error' | 'success' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastProps {
  item: ToastItem;
  onRemove: (id: string) => void;
}

const AUTO_DISMISS_MS: Record<ToastType, number> = {
  error: 5000,
  success: 3000,
  info: 3000,
};

const TYPE_CONFIG: Record<ToastType, { border: string; icon: React.ElementType; iconCls: string }> = {
  error:   { border: 'border-l-error',   icon: AlertCircle,  iconCls: 'text-error'   },
  success: { border: 'border-l-success', icon: CheckCircle2, iconCls: 'text-success' },
  info:    { border: 'border-l-info',    icon: Info,         iconCls: 'text-info'    },
};

export function Toast({ item, onRemove }: ToastProps) {
  // Two-phase visibility: mount with opacity-0, then flip to visible on next frame
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  const dismiss = useCallback(() => {
    if (exiting) return;
    setExiting(true);
    // Remove from DOM after the CSS transition finishes (250ms)
    setTimeout(() => onRemove(item.id), 260);
  }, [exiting, item.id, onRemove]);

  // Trigger enter animation after mount
  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Auto-dismiss timer
  useEffect(() => {
    const t = setTimeout(dismiss, AUTO_DISMISS_MS[item.type]);
    return () => clearTimeout(t);
  }, [dismiss, item.type]);

  const { border, icon: Icon, iconCls } = TYPE_CONFIG[item.type];
  const hidden = !visible || exiting;

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className={[
        'w-80 bg-surface-raised shadow-md rounded-md',
        'border-l-[3px]', border,
        'p-4 flex items-start gap-3 pointer-events-auto',
        'transition-all duration-[250ms] ease-in-out',
        hidden ? 'opacity-0 translate-x-8' : 'opacity-100 translate-x-0',
      ].join(' ')}
    >
      <Icon size={16} className={`mt-0.5 shrink-0 ${iconCls}`} aria-hidden />
      <p className="flex-1 text-[13px] text-primary leading-snug">{item.message}</p>
      <button
        onClick={dismiss}
        aria-label="Cerrar"
        className="shrink-0 text-tertiary hover:text-primary transition-colors transition-base"
      >
        <X size={14} aria-hidden />
      </button>
    </div>
  );
}

'use client';

import type { LucideIcon } from 'lucide-react';
import { X } from 'lucide-react';

// ─── Types ─────────────────────────────────────────────────────────────────────

export type BadgeVariant = 'default' | 'accent' | 'success' | 'warning' | 'error' | 'outline';
export type BadgeSize    = 'sm' | 'md' | 'lg';

export interface BadgeProps {
  children:   React.ReactNode;
  variant?:   BadgeVariant;
  size?:      BadgeSize;
  /** Optional Lucide icon rendered to the left of the label. */
  icon?:      LucideIcon;
  /** Makes the badge interactive — cursor-pointer, hover brightness, active scale. */
  onClick?:   () => void;
  /** Adds a dismissible × button on the right, independent of onClick. */
  onDismiss?: () => void;
  className?: string;
}

// ─── Design maps ──────────────────────────────────────────────────────────────

const VARIANT_CLS: Record<BadgeVariant, string> = {
  default: 'bg-surface-raised text-secondary',
  accent:  'bg-accent-subtle text-accent',
  success: 'bg-success-subtle text-success',
  warning: 'bg-warning-subtle text-warning',
  error:   'bg-error-subtle text-error',
  // Borderless background, strong border to define the shape
  outline: 'border border-strong text-secondary',
};

const SIZE_MAP: Record<BadgeSize, { cls: string; iconPx: number; dismissPx: number }> = {
  sm: { cls: 'text-[11px] font-medium px-1.5 py-0.5', iconPx: 11, dismissPx: 10 },
  md: { cls: 'text-xs font-medium px-2 py-1',          iconPx: 12, dismissPx: 10 },
  lg: { cls: 'text-[13px] font-medium px-2.5 py-1.5',  iconPx: 12, dismissPx: 11 },
};

// ─── Component ─────────────────────────────────────────────────────────────────
//
// Rendered as <span> always so a dismiss <button> inside is valid HTML.
// When onClick is supplied, role="button" + tabIndex + keyboard support make
// the outer span fully accessible without nesting button-in-button.

export function Badge({
  children,
  variant   = 'default',
  size      = 'md',
  icon: Icon,
  onClick,
  onDismiss,
  className = '',
}: BadgeProps) {
  const { cls: sizeCls, iconPx, dismissPx } = SIZE_MAP[size];
  const interactive = !!onClick;

  return (
    <span
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={interactive ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(); }
      } : undefined}
      className={[
        'inline-flex items-center gap-1 rounded-full whitespace-nowrap',
        sizeCls,
        VARIANT_CLS[variant],
        interactive
          ? 'cursor-pointer transition-[filter,transform] transition-fast hover:brightness-[1.05] active:scale-[0.97]'
          : '',
        className,
      ].filter(Boolean).join(' ')}
    >
      {Icon && <Icon size={iconPx} aria-hidden />}
      <span>{children}</span>
      {onDismiss && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onDismiss(); }}
          className="ml-0.5 opacity-60 hover:opacity-100 transition-opacity transition-fast"
          aria-label="Dismiss"
        >
          <X size={dismissPx} aria-hidden />
        </button>
      )}
    </span>
  );
}

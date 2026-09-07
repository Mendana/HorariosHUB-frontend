'use client';

import { LogOut } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { AuthUser, Role } from '@/hooks/useAuth';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';
import { useNotificationPreferences } from '@/lib/hooks/useNotificationPreferences';

const ROLE_VARIANT: Record<Role, BadgeVariant> = {
  student:   'default',
  professor: 'warning',
  admin:     'accent',
};

function getInitials(email: string): string {
  const username = email.split('@')[0] ?? email;
  return username.slice(0, 2).toUpperCase();
}

interface ToggleProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
  disabled?: boolean;
}

function Toggle({ checked, onChange, label, disabled }: ToggleProps) {
  return (
    <button
      role="switch"
      type="button"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={[
        'relative inline-flex h-4 w-7 shrink-0 rounded-full border transition-colors transition-fast',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        checked ? 'bg-accent border-accent' : 'bg-surface-sunken border-strong',
      ].join(' ')}
    >
      <span
        className={[
          'pointer-events-none absolute top-0.5 inline-block h-3 w-3 rounded-full bg-white shadow-sm transition-transform transition-fast',
          checked ? 'translate-x-3.5' : 'translate-x-0.5',
        ].join(' ')}
      />
    </button>
  );
}

interface UserMenuProps {
  user: AuthUser;
  onLogout: () => Promise<void>;
}

export function UserMenu({ user, onLogout }: UserMenuProps) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { preferences, isLoading: prefsLoading, update } = useNotificationPreferences();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="size-8 flex items-center justify-center group"
      >
        <span
          className={[
            'size-7 flex items-center justify-center rounded-full',
            'text-[11px] font-semibold',
            'transition-[background-color,color] transition-base',
            open
              ? 'bg-accent text-white'
              : 'bg-accent-subtle text-accent group-hover:bg-accent group-hover:text-white',
          ].join(' ')}
        >
          {getInitials(user.email)}
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="animate-dropdown absolute right-0 top-full mt-1.5 w-56 bg-surface-raised border border-subtle rounded-md shadow-md z-50"
        >
          {/* Email + rol */}
          <div className="px-3 py-3 border-b border-subtle">
            <p className="text-[12px] text-secondary truncate leading-none mb-1.5">
              {user.email}
            </p>
            <Badge variant={ROLE_VARIANT[user.role]} size="sm">
              {t(`roles.${user.role}`)}
            </Badge>
          </div>

          {/* Preferencias de notificación */}
          <div className="px-3 py-2.5 border-b border-subtle">
            <p className="text-[11px] font-medium text-tertiary uppercase tracking-wide mb-2">
              {t('userMenu.notifPrefsTitle')}
            </p>
            <div className="flex flex-col gap-2">
              <label className="flex items-center justify-between gap-2 cursor-default">
                <span className="text-[13px] text-tertiary">{t('userMenu.notifInApp')}</span>
                <Toggle
                  checked={preferences?.inApp ?? true}
                  onChange={() => undefined}
                  label={t('userMenu.notifInApp')}
                  disabled
                />
              </label>
              <label className="flex items-center justify-between gap-2 cursor-pointer">
                <span className="text-[13px] text-secondary">{t('userMenu.notifEmail')}</span>
                <Toggle
                  checked={preferences?.email ?? false}
                  onChange={(v) => update({ email: v })}
                  label={t('userMenu.notifEmail')}
                  disabled={prefsLoading || preferences === null}
                />
              </label>
            </div>
          </div>

          {/* Logout */}
          <div className="py-1">
            <button
              role="menuitem"
              type="button"
              onClick={() => {
                setOpen(false);
                onLogout();
              }}
              className="w-full flex items-center gap-2.5 text-left px-3 py-2 text-[13px] text-secondary hover:text-error hover:bg-surface-sunken transition-[background-color,color] transition-base"
            >
              <LogOut size={14} aria-hidden className="shrink-0" />
              {t('auth.logout')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

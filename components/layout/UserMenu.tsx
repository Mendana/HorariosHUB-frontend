'use client';

import { LogOut } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { AuthUser, Role } from '@/hooks/useAuth';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';

const ROLE_VARIANT: Record<Role, BadgeVariant> = {
  visitor:   'default',
  user:      'default',
  professor: 'warning',
  admin:     'accent',
};

/** Toma las dos primeras letras del username del email, en mayúsculas. */
function getInitials(email: string): string {
  const username = email.split('@')[0] ?? email;
  return username.slice(0, 2).toUpperCase();
}

interface UserMenuProps {
  user: AuthUser;
}

export function UserMenu({ user }: UserMenuProps) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic fuera del menú
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

  // Cerrar con Escape
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
      {/* Trigger: avatar con iniciales */}
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

      {/* Dropdown */}
      {open && (
        <div
          role="menu"
          className="animate-dropdown absolute right-0 top-full mt-1.5 w-[200px] bg-surface-raised border border-subtle rounded-md shadow-md z-50"
        >
          {/* Cabecera: email + rol */}
          <div className="px-3 py-3 border-b border-subtle">
            <p className="text-[12px] text-secondary truncate leading-none mb-1.5">
              {user.email}
            </p>
            <Badge variant={ROLE_VARIANT[user.role]} size="sm">
              {t(`roles.${user.role}`)}
            </Badge>
          </div>

          {/* Acciones */}
          <div className="py-1">
            <button
              role="menuitem"
              type="button"
              onClick={() => {
                setOpen(false);
                // TODO: llamar a POST /api/auth/logout
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

'use client';

import { ChevronDown } from 'lucide-react';
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
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-sm font-medium text-secondary hover:text-primary hover:bg-surface-raised"
      >
        <span className="max-w-40 truncate">
          {user.email || t('topbar.profile')}
        </span>
        <ChevronDown
          size={14}
          aria-hidden
          className={open ? 'rotate-180' : ''}
          style={{ transition: 'transform 150ms' }}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1.5 w-56 bg-surface-raised border border-subtle rounded-md shadow-sm z-50"
        >
          {/* Cabecera: email + rol */}
          <div className="px-4 py-3 border-b border-subtle">
            <p className="text-sm font-medium text-primary truncate">{user.email}</p>
            <Badge variant={ROLE_VARIANT[user.role]} size="sm" className="mt-1.5">
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
              className="w-full text-left px-4 py-2 text-sm text-secondary hover:text-primary hover:bg-surface-sunken"
            >
              {t('auth.logout')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

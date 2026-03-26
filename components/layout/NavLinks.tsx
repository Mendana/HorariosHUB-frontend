'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { Role } from '@/hooks/useAuth';

type NavLabelKey = 'schedule' | 'mySubjects' | 'proposals' | 'manage' | 'manageUsers';

interface NavItem {
  href: string;
  labelKey: NavLabelKey;
  /** Roles que pueden ver este enlace. null = visitante no autenticado. */
  roles: Array<Role | null>;
}

const NAV_ITEMS: NavItem[] = [
  {
    href: '/',
    labelKey: 'schedule',
    roles: [null, 'visitor', 'user', 'professor', 'admin'],
  },
  {
    href: '/my-subjects',
    labelKey: 'mySubjects',
    roles: ['user', 'professor', 'admin'],
  },
  {
    href: '/proposals',
    labelKey: 'proposals',
    roles: ['user', 'professor', 'admin'],
  },
  {
    href: '/manage/classes',
    labelKey: 'manage',
    roles: ['professor', 'admin'],
  },
  {
    href: '/manage/users',
    labelKey: 'manageUsers',
    roles: ['admin'],
  },
];

interface NavLinksProps {
  /** null = visitante no autenticado */
  role: Role | null;
  /** Callback al navegar — usado por el menú móvil para cerrarse */
  onNavigate?: () => void;
  /** true = apilados verticalmente (menú móvil); false = en línea (topbar) */
  vertical?: boolean;
}

export function NavLinks({ role, onNavigate, vertical = false }: NavLinksProps) {
  const t = useTranslations('nav');
  const pathname = usePathname();

  const labels: Record<NavLabelKey, string> = {
    schedule: t('schedule'),
    mySubjects: t('mySubjects'),
    proposals: t('proposals'),
    manage: t('manage'),
    manageUsers: t('manageUsers'),
  };

  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(role));

  const wrapperClass = vertical
    ? 'flex flex-col gap-1'
    : 'flex items-center gap-1';

  function linkCls(isActive: boolean) {
    const shared = 'transition-[background-color,color,transform] transition-base';
    if (vertical) {
      return [
        'block w-full px-3 py-2.5 rounded-sm text-sm',
        'active:scale-[0.98]',
        shared,
        isActive
          ? 'font-medium text-primary bg-accent-subtle'
          : 'text-secondary hover:text-primary hover:bg-surface-raised',
      ].join(' ');
    }
    return [
      'px-3 py-1.5 rounded-sm text-sm',
      shared,
      isActive
        ? 'font-medium text-primary bg-accent-subtle [border-bottom:2px_solid_var(--accent)]'
        : 'text-secondary hover:text-primary hover:bg-surface-raised',
    ].join(' ');
  }

  return (
    <nav aria-label={t('ariaLabel')} className={wrapperClass}>
      {visibleItems.map((item) => {
        const isActive =
          item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={isActive ? 'page' : undefined}
            className={linkCls(isActive)}
          >
            {labels[item.labelKey]}
          </Link>
        );
      })}
    </nav>
  );
}

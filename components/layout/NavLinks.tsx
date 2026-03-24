'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { Role } from '@/hooks/useAuth';

type NavLabelKey = 'schedule' | 'mySubjects' | 'proposals' | 'manage';

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
  };

  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(role));

  const wrapperClass = vertical
    ? 'flex flex-col gap-1'
    : 'flex items-center gap-1';

  const linkBase = vertical
    ? 'block px-3 py-2 rounded-sm text-sm font-medium'
    : 'px-3 py-1.5 rounded-sm text-sm font-medium';

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
            className={[
              linkBase,
              isActive
                ? 'text-accent'
                : 'text-secondary hover:text-primary',
            ].join(' ')}
          >
            {labels[item.labelKey]}
          </Link>
        );
      })}
    </nav>
  );
}

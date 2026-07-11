'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { Role } from '@/hooks/useAuth';

type NavLabelKey = 'schedule' | 'mySubjects' | 'stats' | 'proposals' | 'manage' | 'manageUsers';

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
    roles: [null, 'student', 'profesor', 'admin'],
  },
  {
    href: '/my-subjects',
    labelKey: 'mySubjects',
    roles: ['student', 'profesor', 'admin'],
  },
  {
    href: '/stats',
    labelKey: 'stats',
    roles: ['student', 'profesor', 'admin'],
  },
  {
    href: '/proposals',
    labelKey: 'proposals',
    roles: ['student', 'profesor', 'admin'],
  },
  {
    href: '/manage/classes',
    labelKey: 'manage',
    roles: ['profesor', 'admin'],
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
    schedule:    t('schedule'),
    mySubjects:  t('mySubjects'),
    stats:       t('stats'),
    proposals:   t('proposals'),
    manage:      t('manage'),
    manageUsers: t('manageUsers'),
  };

  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(role));

  const wrapperClass = vertical
    ? 'flex flex-col gap-1'
    : 'flex items-center gap-0.5';

  function linkCls(isActive: boolean) {
    if (vertical) {
      return [
        'block w-full px-3 py-2.5 rounded-sm text-sm',
        'transition-[background-color,color] transition-base active:scale-[0.98]',
        isActive
          ? 'font-medium text-primary bg-accent-subtle'
          : 'text-secondary hover:text-primary hover:bg-surface-raised',
      ].join(' ');
    }
    // Horizontal (topbar): small-strong (13px/500) + indicador inferior activo
    return [
      'px-3 py-2 rounded-sm text-[13px] font-medium tracking-[-0.01em]',
      'transition-[background-color,color,box-shadow] transition-base',
      isActive
        ? 'text-primary bg-accent-subtle [box-shadow:inset_0_-2px_0_var(--accent)]'
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

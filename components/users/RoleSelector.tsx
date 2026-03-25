'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Spinner } from '@/components/ui/Spinner';
import type { UserRole } from '@/lib/types/users';

const ROLE_OPTIONS: UserRole[] = ['user', 'professor', 'admin'];

interface RoleSelectorProps {
  email: string;
  currentRole: UserRole;
  isSelf: boolean;
  onChangeRole: (email: string, role: UserRole) => Promise<void>;
}

export function RoleSelector({ email, currentRole, isSelf, onChangeRole }: RoleSelectorProps) {
  const t = useTranslations('users');
  const tRoles = useTranslations('roles');
  const [isChanging, setIsChanging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newRole = e.target.value as UserRole;
    if (newRole === currentRole) return;
    setIsChanging(true);
    setError(null);
    try {
      await onChangeRole(email, newRole);
    } catch {
      setError(t('errorSelfRole'));
    } finally {
      setIsChanging(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <select
          value={currentRole}
          onChange={handleChange}
          disabled={isSelf || isChanging}
          title={isSelf ? t('changeRoleDisabledTip') : undefined}
          className={
            'h-8 px-2 rounded-sm bg-surface-sunken border border-subtle text-sm text-primary ' +
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ' +
            'disabled:opacity-50 disabled:cursor-not-allowed'
          }
        >
          {ROLE_OPTIONS.map((r) => (
            <option key={r} value={r}>{tRoles(r)}</option>
          ))}
        </select>
        {isChanging && <Spinner size={14} />}
      </div>
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  );
}

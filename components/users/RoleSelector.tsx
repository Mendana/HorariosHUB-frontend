'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Spinner } from '@/components/ui/Spinner';
import { Select } from '@/components/ui/Select';
import type { UserRole } from '@/lib/types/users';

const ROLE_OPTIONS: UserRole[] = ['student', 'profesor', 'admin'];

interface RoleSelectorProps {
  id: string;
  currentRole: UserRole;
  isSelf: boolean;
  onChangeRole: (id: string, role: UserRole) => Promise<void>;
}

export function RoleSelector({ id, currentRole, isSelf, onChangeRole }: RoleSelectorProps) {
  const t      = useTranslations('users');
  const tRoles = useTranslations('roles');
  const [isChanging, setIsChanging] = useState(false);
  const [error, setError]           = useState<string | null>(null);

  async function handleChange(newRole: string) {
    if (newRole === currentRole) return;
    setIsChanging(true);
    setError(null);
    try {
      await onChangeRole(id, newRole as UserRole);
    } catch {
      setError(t('errorSelfRole'));
    } finally {
      setIsChanging(false);
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <Select
          value={currentRole}
          onChange={handleChange}
          options={ROLE_OPTIONS.map(r => ({ value: r, label: tRoles(r) }))}
          disabled={isSelf || isChanging}
          size="sm"
          ariaLabel={isSelf ? t('changeRoleDisabledTip') : undefined}
        />
        {isChanging && <Spinner size={14} />}
      </div>
      {error && <p className="mt-1 text-xs text-error">{error}</p>}
    </div>
  );
}

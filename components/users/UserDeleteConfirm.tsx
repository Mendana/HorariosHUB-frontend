'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';

interface UserDeleteConfirmProps {
  email: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

export function UserDeleteConfirm({ email, onConfirm, onClose }: UserDeleteConfirmProps) {
  const t = useTranslations('users');
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleConfirm() {
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Modal onClose={onClose} size="max-w-sm">
      <div className="px-6 py-5">
        <h2 className="text-base font-semibold text-primary mb-2">{t('deleteTitle')}</h2>
        <p className="text-sm text-secondary mb-6 break-all">
          {t('deleteMessage', { email })}
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-sm border border-subtle rounded-sm text-secondary hover:text-primary hover:border-strong transition-colors disabled:opacity-50"
          >
            {t('deleteCancel')}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-error text-white rounded-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isDeleting && <Spinner size={14} />}
            {t('deleteConfirm')}
          </button>
        </div>
      </div>
    </Modal>
  );
}

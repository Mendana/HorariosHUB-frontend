'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Class } from '@/lib/types/classes';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface ClassDeleteConfirmProps {
  cls: Class;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

export function ClassDeleteConfirm({ cls, onConfirm, onClose }: ClassDeleteConfirmProps) {
  const t = useTranslations('classes');
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
        <p className="text-sm text-secondary mb-6">
          {t('deleteMessage', { name: cls.name })}
        </p>

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={isDeleting}>
            {t('deleteCancel')}
          </Button>
          <Button variant="destructive" onClick={handleConfirm} loading={isDeleting}>
            {t('deleteConfirm')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

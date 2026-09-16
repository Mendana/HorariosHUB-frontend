'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import type { DisplayEvent } from '@/lib/types/events';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface EventDeleteConfirmProps {
  event: DisplayEvent;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

export function EventDeleteConfirm({ event, onConfirm, onClose }: EventDeleteConfirmProps) {
  const t = useTranslations('events');
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
        <p className="text-sm text-secondary mb-2">
          {t('deleteMessage', { title: event.title })}
        </p>
        {event.isRecurring && (
          <p className="text-sm text-warning mb-4">{t('deleteRecurringWarning')}</p>
        )}

        <div className={`flex justify-end gap-3 ${event.isRecurring ? '' : 'mt-4'}`}>
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

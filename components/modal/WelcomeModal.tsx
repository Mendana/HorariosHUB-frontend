'use client';

import { useTranslations } from "next-intl";

interface WelcomeModalProps {
  onClose: () => void;
}

export function WelcomeModal({ onClose }: WelcomeModalProps) {

    const t = useTranslations('welcome_modal');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 px-4">
      <div className="bg-surface-base rounded-xl shadow-xl dark:shadow-black/40 max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          aria-label="Cerrar"
        >
          X
        </button>
        <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">{t('title')}</h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          {t('body_1')}<strong>{t('body_2')}</strong>{t('body_3')}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          {t('body_4')}
        </p>
        <button
          onClick={onClose}
          className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white text-sm font-medium py-2 rounded-lg transition"
        >
          {t('accept')}
        </button>
      </div>
    </div>
  );
}
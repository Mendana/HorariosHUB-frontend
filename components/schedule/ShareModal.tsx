'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Check, Copy, Link } from 'lucide-react';
import QRCode from 'qrcode';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { INPUT_FIELD_CLS } from '@/components/ui/Input';

interface ShareModalProps {
  identifier: string;
  onClose: () => void;
}

export function ShareModal({ identifier, onClose }: ShareModalProps) {
  const t = useTranslations('schedule');
  const { user } = useAuth();
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}?uo=${identifier}${user ? '&import=true' : ''}`
      : '';

  useEffect(() => {
    if (!shareUrl) return;
    QRCode.toDataURL(shareUrl, {
      width: 160,
      margin: 1,
      color: {
        dark:  theme === 'dark' ? '#e8e8e5' : '#1a1a18',
        light: theme === 'dark' ? '#1a1a1c' : '#fafaf8',
      },
    })
      .then(setQrDataUrl)
      .catch(() => {});
  }, [shareUrl, theme]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available
    }
  }

  return (
    <Modal
      title={t('shareTitle')}
      size="sm"
      onClose={onClose}
      closeLabel={t('shareClose')}
    >
      <div className="flex flex-col gap-5">
        <p className="text-xs text-secondary -mt-1">{t('shareSubtitle')}</p>

        {/* URL read-only field with copy icon */}
        <div className="relative">
          <input
            type="text"
            readOnly
            value={shareUrl}
            onClick={handleCopy}
            className={`${INPUT_FIELD_CLS} h-9 px-3 pr-9 text-sm w-full cursor-pointer`}
          />
          <button
            type="button"
            onClick={handleCopy}
            aria-label={t('shareCopyLink')}
            className="absolute top-1/2 right-2.5 -translate-y-1/2 text-tertiary hover:text-primary transition-colors transition-fast"
          >
            {copied
              ? <Check size={14} className="text-success" aria-hidden />
              : <Copy size={14} aria-hidden />
            }
          </button>
        </div>

        {/* Primary copy-link button */}
        <Button variant="primary" fullWidth iconLeft={Link} onClick={handleCopy}>
          {copied ? t('shareCopied') : t('shareCopyLink')}
        </Button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-subtle" aria-hidden />
          <span className="text-xs text-tertiary">o</span>
          <div className="flex-1 h-px bg-subtle" aria-hidden />
        </div>

        {/* QR code */}
        <div className="flex flex-col items-center gap-2">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="QR"
              width={160}
              height={160}
              className="rounded-sm"
            />
          ) : (
            <div className="size-40 bg-surface-sunken rounded-sm animate-pulse" />
          )}
          <p className="text-xs text-tertiary">{t('shareQrCaption')}</p>
        </div>
      </div>
    </Modal>
  );
}

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchScraperSyncStatus, triggerScraperSync as apiTriggerScraperSync } from '../api/admin';
import { getErrorMessage, isApiError } from '../errors';
import type { ScraperSyncResult, ScraperSyncStatus } from '../types/admin';

const POLL_INTERVAL_MS = 12_000;

export type ScraperTriggerState = 'idle' | 'triggering' | 'success' | 'conflict' | 'error';

export interface UseScraperSyncResult {
  status: ScraperSyncStatus | null;
  isStatusLoading: boolean;
  triggerState: ScraperTriggerState;
  result: ScraperSyncResult | null;
  errorMessage: string;
  trigger: () => void;
}

export function useScraperSync(): UseScraperSyncResult {
  const [status, setStatus] = useState<ScraperSyncStatus | null>(null);
  const [isStatusLoading, setIsStatusLoading] = useState(true);
  const [triggerState, setTriggerState] = useState<ScraperTriggerState>('idle');
  const [result, setResult] = useState<ScraperSyncResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const refreshStatus = useCallback(async () => {
    try {
      const data = await fetchScraperSyncStatus();
      setStatus(data);
      if (!data.syncing) stopPolling();
    } catch {
      // Transient polling errors are ignored — keep showing the last known status.
    }
  }, [stopPolling]);

  const startPolling = useCallback(() => {
    if (pollRef.current) return;
    pollRef.current = setInterval(refreshStatus, POLL_INTERVAL_MS);
  }, [refreshStatus]);

  // Initial status check — detects a sync already running (another admin or the 5 AM cronjob).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchScraperSyncStatus();
        if (cancelled) return;
        setStatus(data);
        if (data.syncing) startPolling();
      } finally {
        if (!cancelled) setIsStatusLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => stopPolling, [stopPolling]);

  const trigger = useCallback(() => {
    setTriggerState('triggering');
    setErrorMessage('');
    setResult(null);
    startPolling();

    apiTriggerScraperSync()
      .then((data) => {
        setResult(data);
        setTriggerState('success');
      })
      .catch((err) => {
        if (isApiError(err) && err.status === 409) {
          setTriggerState('conflict');
        } else {
          setErrorMessage(getErrorMessage(err));
          setTriggerState('error');
        }
      })
      .finally(() => {
        void refreshStatus();
      });
  }, [startPolling, refreshStatus]);

  return { status, isStatusLoading, triggerState, result, errorMessage, trigger };
}

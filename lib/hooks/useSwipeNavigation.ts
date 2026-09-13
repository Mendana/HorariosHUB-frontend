'use client';

import { useRef } from 'react';

interface SwipeStart {
  x: number;
  y: number;
}

interface UseSwipeNavigationOptions {
  /** Fired when the user swipes right-to-left (natural "go forward" gesture). */
  onSwipeLeft: () => void;
  /** Fired when the user swipes left-to-right (natural "go back" gesture). */
  onSwipeRight: () => void;
  /** Minimum horizontal distance (px) to count as a swipe. */
  threshold?: number;
  /** Maximum vertical drift (px) allowed — beyond this it's treated as a scroll, not a swipe. */
  restraint?: number;
}

function isPinchZoomed(): boolean {
  if (typeof window === 'undefined') return false;
  const vv = window.visualViewport;
  return !!vv && vv.scale > 1.01;
}

/**
 * Single-finger horizontal swipe detector for touch navigation (week/month paging).
 *
 * Guards against the two things that made the old inline handlers feel broken:
 *   - Pinch-zoom gestures (2+ fingers, or the page already pinch-zoomed) never
 *     trigger a swipe — tracking is dropped as soon as a second finger joins.
 *   - Vertical scrolling isn't misread as a swipe — the gesture must stay mostly
 *     horizontal (dy within `restraint`) to count.
 */
export function useSwipeNavigation({
  onSwipeLeft,
  onSwipeRight,
  threshold = 60,
  restraint = 75,
}: UseSwipeNavigationOptions) {
  const startRef = useRef<SwipeStart | null>(null);

  function handleTouchStart(e: React.TouchEvent) {
    if (e.touches.length !== 1 || isPinchZoomed()) {
      startRef.current = null;
      return;
    }
    startRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (!startRef.current) return;
    // A second finger joining mid-gesture means this became a pinch — abort.
    if (e.touches.length > 1) startRef.current = null;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    const start = startRef.current;
    startRef.current = null;
    if (!start || e.changedTouches.length !== 1 || isPinchZoomed()) return;

    const dx = e.changedTouches[0].clientX - start.x;
    const dy = e.changedTouches[0].clientY - start.y;

    if (Math.abs(dx) < threshold || Math.abs(dy) > restraint) return;

    if (dx < 0) onSwipeLeft();
    else onSwipeRight();
  }

  return { onTouchStart: handleTouchStart, onTouchMove: handleTouchMove, onTouchEnd: handleTouchEnd };
}

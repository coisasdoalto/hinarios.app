import { useRouter } from 'next/router';
import { useEffect, useRef } from 'react';

import { isEditableElement, isPageShortcut } from '../utils/keyboardShortcuts';
import { getSwipeDirection, isInsideHorizontalScroller, TouchPoint } from '../utils/swipe';

export const PREVIOUS_KEY = 'ArrowLeft';
export const NEXT_KEY = 'ArrowRight';

/** Touches here belong to the sidebar, dialogs, or form controls */
const SWIPE_IGNORED_TARGETS = "nav, [role='dialog'], [role='slider'], button, a, input";

type PagerNavigationOptions = {
  previousHref?: string;
  nextHref?: string;
  /** Turn shortcuts off, e.g. while slide mode uses the same keys */
  enabled?: boolean;
};

/**
 * Goes to the previous/next page with the ←/→ keys and with horizontal swipes
 * on touch screens (swipe left for next, right for previous).
 * @example usePagerNavigation({ previousHref: '/hc/1', nextHref: '/hc/3' });
 */
export function usePagerNavigation({
  previousHref,
  nextHref,
  enabled = true,
}: PagerNavigationOptions): void {
  const router = useRouter();
  const stateRef = useRef({ previousHref, nextHref, enabled, router });
  stateRef.current = { previousHref, nextHref, enabled, router };

  useEffect(() => {
    // Next updates the URL before rendering the new page; ignore shortcuts in
    // between so a quick second press does not use the old page's links.
    let isNavigating = false;
    const handleRouteChangeStart = () => {
      isNavigating = true;
    };
    const handleRouteChangeEnd = () => {
      isNavigating = false;
    };

    const go = (href?: string) => {
      const state = stateRef.current;
      if (!href || !state.enabled || isNavigating) return false;

      isNavigating = true;
      state.router.push(href);
      return true;
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const { previousHref: previous, nextHref: next } = stateRef.current;
      const href = isPageShortcut(event, PREVIOUS_KEY)
        ? previous
        : isPageShortcut(event, NEXT_KEY)
        ? next
        : undefined;

      if (go(href)) event.preventDefault();
    };

    let touchStart: TouchPoint | null = null;

    const handleTouchStart = (event: TouchEvent) => {
      const zoom = window.visualViewport?.scale ?? 1;
      const isIgnored =
        event.touches.length !== 1 ||
        zoom > 1.01 ||
        isEditableElement(event.target) ||
        (event.target instanceof Element && event.target.closest(SWIPE_IGNORED_TARGETS)) ||
        isInsideHorizontalScroller(event.target);

      touchStart = isIgnored
        ? null
        : { x: event.touches[0].clientX, y: event.touches[0].clientY, time: event.timeStamp };
    };

    const handleTouchEnd = (event: TouchEvent) => {
      const start = touchStart;
      touchStart = null;
      if (!start || event.changedTouches.length !== 1) return;
      if (!window.getSelection()?.isCollapsed) return;

      const touch = event.changedTouches[0];
      const direction = getSwipeDirection(
        start,
        { x: touch.clientX, y: touch.clientY, time: event.timeStamp },
        window.innerWidth
      );
      const { previousHref: previous, nextHref: next } = stateRef.current;

      if (direction === 'left') go(next);
      if (direction === 'right') go(previous);
    };

    const handleTouchCancel = () => {
      touchStart = null;
    };

    const { events } = stateRef.current.router;
    events?.on('routeChangeStart', handleRouteChangeStart);
    events?.on('routeChangeComplete', handleRouteChangeEnd);
    events?.on('routeChangeError', handleRouteChangeEnd);
    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    document.addEventListener('touchcancel', handleTouchCancel, { passive: true });

    return () => {
      events?.off('routeChangeStart', handleRouteChangeStart);
      events?.off('routeChangeComplete', handleRouteChangeEnd);
      events?.off('routeChangeError', handleRouteChangeEnd);
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchCancel);
    };
  }, []);
}

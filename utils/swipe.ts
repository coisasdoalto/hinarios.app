export type SwipeDirection = 'left' | 'right';

export type TouchPoint = { x: number; y: number; time: number };

/** Minimum horizontal distance, in px, for a swipe */
export const SWIPE_MIN_DISTANCE = 70;
/** Horizontal movement must dominate vertical movement by this factor */
export const SWIPE_DIRECTION_RATIO = 2;
/** Slower gestures are treated as reading/scrolling, not swipes */
export const SWIPE_MAX_DURATION = 700;
/** Touches starting this close to the screen edge belong to OS back/forward gestures */
export const SWIPE_EDGE_MARGIN = 24;

/**
 * Classifies a finished touch as a horizontal swipe, or null when it was a
 * tap, a scroll, a slow drag, or started at the screen edge.
 * @example getSwipeDirection(start, end, window.innerWidth) // 'left'
 */
export function getSwipeDirection(
  start: TouchPoint,
  end: TouchPoint,
  viewportWidth: number
): SwipeDirection | null {
  if (start.x < SWIPE_EDGE_MARGIN || start.x > viewportWidth - SWIPE_EDGE_MARGIN) return null;

  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;

  if (Math.abs(deltaX) < SWIPE_MIN_DISTANCE) return null;
  if (Math.abs(deltaX) < Math.abs(deltaY) * SWIPE_DIRECTION_RATIO) return null;
  if (end.time - start.time > SWIPE_MAX_DURATION) return null;

  return deltaX < 0 ? 'left' : 'right';
}

/** True when the element, or an ancestor, scrolls horizontally on its own */
export function isInsideHorizontalScroller(element: EventTarget | null): boolean {
  let current = element instanceof HTMLElement ? element : null;

  while (current && current !== document.body) {
    const { overflowX } = window.getComputedStyle(current);
    if (
      (overflowX === 'auto' || overflowX === 'scroll') &&
      current.scrollWidth > current.clientWidth
    ) {
      return true;
    }
    current = current.parentElement;
  }

  return false;
}

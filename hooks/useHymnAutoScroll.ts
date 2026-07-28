import { useCallback, useEffect, useRef, useState } from 'react';

export type AutoScrollSpeed = 'slow' | 'medium' | 'fast';

export type HymnAutoScrollState = {
  enabled: boolean;
  pause: () => void;
  paused: boolean;
  setEnabled: (enabled: boolean) => void;
  setSpeed: (speed: AutoScrollSpeed) => void;
  speed: AutoScrollSpeed;
  togglePaused: () => void;
};

export interface AutoScrollViewport {
  cancelFrame(frameId: number): void;
  getMaximumScrollTop(): number;
  getScrollTop(): number;
  requestFrame(callback: FrameRequestCallback): number;
  scrollTo(scrollTop: number): void;
}

type AutoScrollAnimation = {
  enabled: boolean;
  onReachEnd: () => void;
  paused: boolean;
  speed: AutoScrollSpeed;
  viewport: AutoScrollViewport;
};

const PIXELS_PER_SECOND: Record<AutoScrollSpeed, number> = {
  fast: 48,
  medium: 28,
  slow: 14,
};
const MAXIMUM_FRAME_DURATION = 100;

export const browserAutoScrollViewport: AutoScrollViewport = {
  cancelFrame(frameId: number): void {
    window.cancelAnimationFrame(frameId);
  },
  getMaximumScrollTop(): number {
    return Math.max(document.documentElement.scrollHeight - window.innerHeight, 0);
  },
  getScrollTop(): number {
    return window.scrollY;
  },
  requestFrame(callback: FrameRequestCallback): number {
    return window.requestAnimationFrame(callback);
  },
  scrollTo(scrollTop: number): void {
    window.scrollTo({ behavior: 'auto', top: scrollTop });
  },
};

function calculateNextScrollTop(
  viewport: AutoScrollViewport,
  elapsedMilliseconds: number,
  speed: AutoScrollSpeed
): number {
  const frameDuration = Math.min(elapsedMilliseconds, MAXIMUM_FRAME_DURATION);
  const distance = PIXELS_PER_SECOND[speed] * (frameDuration / 1000);
  return Math.min(viewport.getScrollTop() + distance, viewport.getMaximumScrollTop());
}

function moveViewport(animation: AutoScrollAnimation, elapsedMilliseconds: number): boolean {
  const nextScrollTop = calculateNextScrollTop(
    animation.viewport,
    elapsedMilliseconds,
    animation.speed
  );
  animation.viewport.scrollTo(nextScrollTop);
  return nextScrollTop >= animation.viewport.getMaximumScrollTop();
}

function startAutoScrollAnimation(animation: AutoScrollAnimation): () => void {
  let previousTimestamp: number | undefined;
  let frameId = 0;
  function advanceFrame(timestamp: number): void {
    if (previousTimestamp !== undefined && moveViewport(animation, timestamp - previousTimestamp)) {
      animation.onReachEnd();
      return;
    }
    previousTimestamp = timestamp;
    frameId = animation.viewport.requestFrame(advanceFrame);
  }

  frameId = animation.viewport.requestFrame(advanceFrame);
  return () => animation.viewport.cancelFrame(frameId);
}

function useAutoScrollAnimation(animation: AutoScrollAnimation): void {
  useEffect(() => {
    if (!animation.enabled || animation.paused) return undefined;
    return startAutoScrollAnimation(animation);
  }, [
    animation.enabled,
    animation.onReachEnd,
    animation.paused,
    animation.speed,
    animation.viewport,
  ]);
}

function useResetOnHymnChange(
  hymnId: string,
  resetAutoScroll: () => void,
  viewport: AutoScrollViewport
): void {
  const previousHymnId = useRef(hymnId);

  useEffect(() => {
    if (previousHymnId.current === hymnId) return;
    previousHymnId.current = hymnId;
    resetAutoScroll();
    viewport.scrollTo(0);
  }, [hymnId, resetAutoScroll, viewport]);
}

/**
 * Controls automatic page scrolling without mutating or persisting hymn data.
 *
 * @example const autoScroll = useHymnAutoScroll(hymn.id)
 */
export function useHymnAutoScroll(
  hymnId: string,
  viewport: AutoScrollViewport = browserAutoScrollViewport
): HymnAutoScrollState {
  const [enabled, setEnabledState] = useState(false);
  const [paused, setPaused] = useState(false);
  const [speed, setSpeed] = useState<AutoScrollSpeed>('medium');
  const pause = useCallback(() => {
    if (enabled) setPaused(true);
  }, [enabled]);
  const pauseAtEnd = useCallback(() => setPaused(true), []);
  const reset = useCallback(() => {
    setEnabledState(false);
    setPaused(false);
  }, []);
  const setEnabled = useCallback((nextEnabled: boolean) => {
    setEnabledState(nextEnabled);
    setPaused(false);
  }, []);
  const togglePaused = useCallback(() => setPaused((isPaused) => !isPaused), []);

  useAutoScrollAnimation({ enabled, onReachEnd: pauseAtEnd, paused, speed, viewport });
  useResetOnHymnChange(hymnId, reset, viewport);

  return { enabled, pause, paused, setEnabled, setSpeed, speed, togglePaused };
}

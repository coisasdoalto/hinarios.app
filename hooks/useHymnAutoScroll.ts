import { useCallback, useEffect, useRef, useState } from 'react';

export type AutoScrollSpeed = number;

export type HymnAutoScrollState = {
  enabled: boolean;
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

type AutoScrollProgress = {
  accumulatedPixels: number;
};

export const AUTO_SCROLL_MINIMUM_SPEED = 1;
export const AUTO_SCROLL_MAXIMUM_SPEED = 20;
export const AUTO_SCROLL_DEFAULT_SPEED = 5;
const MAXIMUM_FRAME_DURATION = 100;
// A non-zero floor keeps low slider values perceptible on large desktop viewports.
const MINIMUM_PIXELS_PER_SECOND = 12;
const MAXIMUM_PIXELS_PER_SECOND = 80;
const SPEED_CURVE_EXPONENT = 1.5;

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

function calculateScrollDistance(elapsedMilliseconds: number, speed: AutoScrollSpeed): number {
  const frameDuration = Math.min(elapsedMilliseconds, MAXIMUM_FRAME_DURATION);
  return calculatePixelsPerSecond(speed) * (frameDuration / 1000);
}

function constrainAutoScrollSpeed(speed: AutoScrollSpeed): AutoScrollSpeed {
  return Math.min(
    Math.max(Math.round(speed), AUTO_SCROLL_MINIMUM_SPEED),
    AUTO_SCROLL_MAXIMUM_SPEED
  );
}

function calculatePixelsPerSecond(speed: AutoScrollSpeed): number {
  const constrainedSpeed = constrainAutoScrollSpeed(speed);
  const speedRange = AUTO_SCROLL_MAXIMUM_SPEED - AUTO_SCROLL_MINIMUM_SPEED;
  const normalizedSpeed = (constrainedSpeed - AUTO_SCROLL_MINIMUM_SPEED) / speedRange;
  const curvedSpeed = Math.pow(normalizedSpeed, SPEED_CURVE_EXPONENT);
  const pixelsPerSecondRange = MAXIMUM_PIXELS_PER_SECOND - MINIMUM_PIXELS_PER_SECOND;
  return MINIMUM_PIXELS_PER_SECOND + curvedSpeed * pixelsPerSecondRange;
}

function moveViewport(
  animation: AutoScrollAnimation,
  progress: AutoScrollProgress,
  elapsedMilliseconds: number
): boolean {
  const currentScrollTop = animation.viewport.getScrollTop();
  const maximumScrollTop = animation.viewport.getMaximumScrollTop();
  if (currentScrollTop >= maximumScrollTop) return true;

  progress.accumulatedPixels += calculateScrollDistance(elapsedMilliseconds, animation.speed);
  const pixelsToScroll = Math.floor(progress.accumulatedPixels);
  if (pixelsToScroll === 0) return false;

  const nextScrollTop = Math.min(currentScrollTop + pixelsToScroll, maximumScrollTop);
  // Browser scroll positions may be quantized, so retain unused subpixels across frames.
  progress.accumulatedPixels -= nextScrollTop - currentScrollTop;
  animation.viewport.scrollTo(nextScrollTop);
  return nextScrollTop >= maximumScrollTop;
}

function startAutoScrollAnimation(animation: AutoScrollAnimation): () => void {
  const progress: AutoScrollProgress = { accumulatedPixels: 0 };
  let previousTimestamp: number | undefined;
  let frameId = 0;
  function advanceFrame(timestamp: number): void {
    if (
      previousTimestamp !== undefined &&
      moveViewport(animation, progress, timestamp - previousTimestamp)
    ) {
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
  const [speed, setSpeedState] = useState<AutoScrollSpeed>(AUTO_SCROLL_DEFAULT_SPEED);
  const pauseAtEnd = useCallback(() => setPaused(true), []);
  const reset = useCallback(() => {
    setEnabledState(false);
    setPaused(false);
  }, []);
  const setEnabled = useCallback((nextEnabled: boolean) => {
    setEnabledState(nextEnabled);
    setPaused(false);
  }, []);
  const setSpeed = useCallback(
    (nextSpeed: AutoScrollSpeed) => setSpeedState(constrainAutoScrollSpeed(nextSpeed)),
    []
  );
  const togglePaused = useCallback(() => setPaused((isPaused) => !isPaused), []);

  useAutoScrollAnimation({ enabled, onReachEnd: pauseAtEnd, paused, speed, viewport });
  useResetOnHymnChange(hymnId, reset, viewport);

  return { enabled, paused, setEnabled, setSpeed, speed, togglePaused };
}

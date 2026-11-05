import { useEffect, useState } from 'react';

/** Diameter of the side arrow buttons, in px */
export const SIDE_ARROW_SIZE = 44;
/** Space between an arrow and the content column */
const CONTENT_GAP = 16;
/** Minimum space between an arrow and the edge of the main area */
const EDGE_GAP = 8;

/** Marks the element whose sides the arrows sit next to */
export const HYMN_CONTENT_SELECTOR = '[data-hymn-content]';

export type SideArrowBounds = {
  /** Left/right edges of the content's text column */
  contentLeft: number;
  contentRight: number;
  /** Left/right edges of the area the page may use (excludes the sidebar) */
  areaLeft: number;
  areaRight: number;
};

export type SideArrowLayout = {
  /** x of the left edge of each arrow, or null when they do not fit */
  arrows: { previous: number; next: number } | null;
  /** Left edge of the page area, for centering the bottom bar there */
  areaLeft: number;
};

/**
 * Places the arrows just outside the content column, or returns null when
 * there is not enough room on both sides (phones, sidebar open on a small
 * screen) and the bottom bar should be used instead.
 * @example computeSideArrows({ contentLeft: 240, contentRight: 1200, areaLeft: 0, areaRight: 1440 })
 */
export function computeSideArrows({
  contentLeft,
  contentRight,
  areaLeft,
  areaRight,
}: SideArrowBounds): SideArrowLayout['arrows'] {
  const needed = SIDE_ARROW_SIZE + CONTENT_GAP + EDGE_GAP;

  if (contentLeft - areaLeft < needed || areaRight - contentRight < needed) return null;

  return {
    previous: contentLeft - CONTENT_GAP - SIDE_ARROW_SIZE,
    next: contentRight + CONTENT_GAP,
  };
}

function measure(): SideArrowLayout | null {
  const content = document.querySelector<HTMLElement>(HYMN_CONTENT_SELECTOR);
  const main = content?.closest('main');
  if (!content || !main) return null;

  const contentRect = content.getBoundingClientRect();
  const contentStyle = window.getComputedStyle(content);
  const mainRect = main.getBoundingClientRect();

  return {
    areaLeft: mainRect.left,
    arrows: computeSideArrows({
      contentLeft: contentRect.left + parseFloat(contentStyle.paddingLeft || '0'),
      contentRight: contentRect.right - parseFloat(contentStyle.paddingRight || '0'),
      areaLeft: mainRect.left,
      areaRight: Math.min(mainRect.right, document.documentElement.clientWidth),
    }),
  };
}

/**
 * Measures where the side arrows go, following window resizes and the
 * sidebar opening/closing. Undefined until measured (e.g. on the server).
 */
export function useSideArrowLayout(): SideArrowLayout | null | undefined {
  const [layout, setLayout] = useState<SideArrowLayout | null | undefined>(undefined);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const next = measure();
        setLayout((current) => (JSON.stringify(current) === JSON.stringify(next) ? current : next));
      });
    };

    update();
    window.addEventListener('resize', update);

    const content = document.querySelector(HYMN_CONTENT_SELECTOR);
    const main = content?.closest('main');
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
    [content, main].forEach((element) => element && observer?.observe(element));

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', update);
      observer?.disconnect();
    };
  }, []);

  return layout;
}

import { useEffect, useState } from 'react';

/** Diameter of the side arrow buttons, in px */
export const SIDE_ARROW_SIZE = 44;
/** Space between an arrow and the content's text */
const CONTENT_GAP = 12;
/** Minimum space between an arrow and the edge of the page area */
const EDGE_GAP = 8;
/** The content's own horizontal padding (Mantine Container `md`) */
const CONTENT_PADDING = 16;
/** AppShell's own padding around <main> (Mantine `md`) */
const MAIN_PADDING = 16;
/** Side arrows from Mantine's `sm` breakpoint up; phones use the bottom bar */
const SIDE_ARROWS_MEDIA_QUERY = '(min-width: 768px)';

/** Marks the element whose sides the arrows sit next to */
export const HYMN_CONTENT_SELECTOR = '[data-hymn-content]';
/**
 * Extra horizontal padding the content needs so the arrows do not cover it,
 * set on the content element when the arrows do not fit outside it.
 */
export const SIDE_INSET_VARIABLE = '--hymn-side-inset';

export type SideArrowBounds = {
  /** Left/right edges of the content element (border box) */
  contentLeft: number;
  contentRight: number;
  /** Left/right edges of the area the page may use (excludes the sidebar) */
  areaLeft: number;
  areaRight: number;
};

export type SideArrowPlacement = {
  /** x of the left edge of each arrow */
  previous: number;
  next: number;
  /** Extra padding on each side of the content so the arrows do not cover it */
  inset: number;
};

export type SideArrowLayout = {
  /** null on phones, where the bottom bar is used */
  arrows: SideArrowPlacement | null;
};

/**
 * Places the arrows just outside the content's text. When there is no room
 * for that, the arrows stay inside the page area and the content gets an
 * inset (the same on both sides) so they never cover the text.
 * @example computeSideArrows({ contentLeft: 240, contentRight: 1200, areaLeft: 0, areaRight: 1440 })
 */
export function computeSideArrows({
  contentLeft,
  contentRight,
  areaLeft,
  areaRight,
}: SideArrowBounds): SideArrowPlacement {
  const textLeft = contentLeft + CONTENT_PADDING;
  const textRight = contentRight - CONTENT_PADDING;

  const previous = Math.max(areaLeft + EDGE_GAP, textLeft - CONTENT_GAP - SIDE_ARROW_SIZE);
  const next = Math.min(areaRight - EDGE_GAP - SIDE_ARROW_SIZE, textRight + CONTENT_GAP);

  const leftInset = previous + SIDE_ARROW_SIZE + CONTENT_GAP - textLeft;
  const rightInset = textRight + CONTENT_GAP - next;

  return { previous, next, inset: Math.max(0, leftInset, rightInset) };
}

function measure(): SideArrowLayout | null {
  const content = document.querySelector<HTMLElement>(HYMN_CONTENT_SELECTOR);
  const main = content?.closest('main');
  if (!content || !main) return null;

  if (!window.matchMedia(SIDE_ARROWS_MEDIA_QUERY).matches) return { arrows: null };

  // The border box does not depend on the inset padding, so applying the
  // inset cannot change the measurement (no resize loop).
  const contentRect = content.getBoundingClientRect();
  const mainRect = main.getBoundingClientRect();
  // <main> spans the whole width; Mantine offsets it from the sidebar with
  // padding (sidebar width + its own spacing), so the area starts there.
  const mainStyle = window.getComputedStyle(main);
  const sidebarWidth = Math.max(0, parseFloat(mainStyle.paddingLeft) - MAIN_PADDING);

  return {
    arrows: computeSideArrows({
      contentLeft: contentRect.left,
      contentRight: contentRect.right,
      areaLeft: mainRect.left + sidebarWidth,
      areaRight: Math.min(mainRect.right, document.documentElement.clientWidth),
    }),
  };
}

/**
 * Measures where the side arrows go, following window resizes and the
 * sidebar opening/closing, and reserves room for them on the content.
 * Undefined until measured (e.g. on the server).
 */
export function useSideArrowLayout(enabled: boolean): SideArrowLayout | null | undefined {
  const [layout, setLayout] = useState<SideArrowLayout | null | undefined>(undefined);

  useEffect(() => {
    if (!enabled) {
      setLayout(undefined);
      return undefined;
    }

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
  }, [enabled]);

  const inset = layout?.arrows?.inset ?? 0;

  useEffect(() => {
    const content = document.querySelector<HTMLElement>(HYMN_CONTENT_SELECTOR);
    if (!content) return undefined;

    content.style.setProperty(SIDE_INSET_VARIABLE, `${inset}px`);
    return () => {
      content.style.removeProperty(SIDE_INSET_VARIABLE);
    };
  }, [inset]);

  return layout;
}

import { describe, expect, it } from '@jest/globals';

import { computeSideArrows, SIDE_ARROW_SIZE } from './sideArrowLayout';

// Content border box edges; its text starts 16px inside (Container padding)
const PADDING = 16;
const GAP = 12;

describe('computeSideArrows', () => {
  it('places the arrows just outside the text when there is room', () => {
    expect(
      computeSideArrows({ contentLeft: 240, contentRight: 1200, areaLeft: 0, areaRight: 1440 })
    ).toEqual({
      previous: 240 + PADDING - GAP - SIDE_ARROW_SIZE,
      next: 1200 - PADDING + GAP,
      inset: 0,
    });
  });

  it('accounts for the sidebar on the left', () => {
    const { previous, inset } = computeSideArrows({
      contentLeft: 390,
      contentRight: 1350,
      areaLeft: 300,
      areaRight: 1440,
    });

    expect(previous).toBe(390 + PADDING - GAP - SIDE_ARROW_SIZE);
    expect(inset).toBe(0);
  });

  it('keeps the arrows inside the page and insets the content when there is no room', () => {
    // Tablet: the content fills the page area
    const placement = computeSideArrows({
      contentLeft: 16,
      contentRight: 752,
      areaLeft: 0,
      areaRight: 768,
    });

    expect(placement.previous).toBe(8);
    expect(placement.next).toBe(768 - 8 - SIDE_ARROW_SIZE);
    // The text (moved in by the inset) clears both arrows by the gap
    const textLeft = 16 + PADDING + placement.inset;
    const textRight = 752 - PADDING - placement.inset;
    expect(textLeft).toBe(placement.previous + SIDE_ARROW_SIZE + GAP);
    expect(textRight).toBe(placement.next - GAP);
  });
});

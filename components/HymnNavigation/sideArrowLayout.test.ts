import { describe, expect, it } from '@jest/globals';

import { computeSideArrows, SIDE_ARROW_SIZE } from './sideArrowLayout';

describe('computeSideArrows', () => {
  it('places the arrows just outside the content column', () => {
    const arrows = computeSideArrows({
      contentLeft: 256,
      contentRight: 1184,
      areaLeft: 0,
      areaRight: 1440,
    });

    expect(arrows).toEqual({ previous: 256 - 16 - SIDE_ARROW_SIZE, next: 1184 + 16 });
  });

  it('accounts for the sidebar on the left', () => {
    const arrows = computeSideArrows({
      contentLeft: 406,
      contentRight: 1334,
      areaLeft: 300,
      areaRight: 1440,
    });

    expect(arrows).toEqual({ previous: 406 - 16 - SIDE_ARROW_SIZE, next: 1334 + 16 });
  });

  it('gives up when either side has no room (bottom bar is used instead)', () => {
    expect(
      computeSideArrows({ contentLeft: 316, contentRight: 1264, areaLeft: 300, areaRight: 1280 })
    ).toBeNull();
    expect(
      computeSideArrows({ contentLeft: 32, contentRight: 358, areaLeft: 0, areaRight: 390 })
    ).toBeNull();
  });
});

import { describe, expect, it } from '@jest/globals';

import { getSwipeDirection } from './swipe';

const at = (x: number, y = 300, time = 0) => ({ x, y, time });
const WIDTH = 400;

describe('getSwipeDirection', () => {
  it('detects quick horizontal swipes', () => {
    expect(getSwipeDirection(at(300), at(150, 310, 200), WIDTH)).toBe('left');
    expect(getSwipeDirection(at(100), at(250, 290, 200), WIDTH)).toBe('right');
  });

  it('ignores short movements and taps', () => {
    expect(getSwipeDirection(at(200), at(160, 300, 100), WIDTH)).toBeNull();
  });

  it('ignores mostly vertical scrolling', () => {
    expect(getSwipeDirection(at(300), at(200, 120, 200), WIDTH)).toBeNull();
  });

  it('ignores slow drags', () => {
    expect(getSwipeDirection(at(300), at(100, 300, 1500), WIDTH)).toBeNull();
  });

  it('leaves edge swipes to the OS back/forward gestures', () => {
    expect(getSwipeDirection(at(10), at(200, 300, 200), WIDTH)).toBeNull();
    expect(getSwipeDirection(at(395), at(200, 300, 200), WIDTH)).toBeNull();
  });
});

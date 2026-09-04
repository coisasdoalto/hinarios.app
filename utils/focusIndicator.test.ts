import { describe, expect, it } from '@jest/globals';

import { getFocusIndicatorColor, getFocusIndicatorShadow } from './focusIndicator';

describe('focus indicator', () => {
  it('uses a light blue in dark mode and dark blue in light mode', () => {
    expect(getFocusIndicatorColor('dark')).toBe('#7dd3fc');
    expect(getFocusIndicatorColor('light')).toBe('#1e3a8a');
  });

  it('only renders the neon shadow while focused', () => {
    expect(getFocusIndicatorShadow(true, '#7dd3fc')).toBe('0 0 0 1px #7dd3fc, 0 0 8px #7dd3fc');
    expect(getFocusIndicatorShadow(false, '#7dd3fc')).toBe('none');
  });
});

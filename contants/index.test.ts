import { describe, expect, it } from '@jest/globals';
import { isHymnBookVisible } from '.';

describe('isHymnBookVisible', () => {
  it('hides Hinos e Cânticos', () => {
    expect(isHymnBookVisible('hinos-e-canticos')).toBe(false);
  });

  it('keeps other hymn books visible', () => {
    expect(isHymnBookVisible('hinos-espirituais')).toBe(true);
  });
});

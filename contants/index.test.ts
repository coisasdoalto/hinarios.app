import { describe, expect, it } from '@jest/globals';
import { isHymnBookVisible } from '.';

describe('isHymnBookVisible', () => {
  it('hides Hinos e Cânticos', () => {
    expect(isHymnBookVisible('hinos-e-canticos')).toBe(false);
  });

  it('shows Hinos e Cânticos when server-side access is granted', () => {
    expect(isHymnBookVisible('hinos-e-canticos', true)).toBe(true);
  });

  it('keeps other hymn books visible', () => {
    expect(isHymnBookVisible('hinos-espirituais')).toBe(true);
  });
});

import { describe, expect, it } from '@jest/globals';
import { resolveHymnBookDisplayName } from './hymnBookInfo';

describe('resolveHymnBookDisplayName', () => {
  it('uses the display-name override when available', () => {
    expect(
      resolveHymnBookDisplayName({
        name: 'Em Espírito, Em Verdade',
        displayName: 'Em Espírito, Em Verdade (beta)',
        acronym: 'EV',
      })
    ).toEqual({
      name: 'Em Espírito, Em Verdade (beta)',
      displayName: 'Em Espírito, Em Verdade (beta)',
      acronym: 'EV',
    });
  });

  it('keeps the original name when no override is provided', () => {
    const hymnBookInfo = { name: 'Hinos e Cânticos' };

    expect(resolveHymnBookDisplayName(hymnBookInfo)).toBe(hymnBookInfo);
  });
});

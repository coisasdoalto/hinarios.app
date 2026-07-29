import { describe, expect, it } from '@jest/globals';
import { compareHymnNumbers, resolveHymnDisplayNumber } from './hymnNumber';

describe('resolveHymnDisplayNumber', () => {
  it('appends a variant without changing unversioned numbers', () => {
    expect(resolveHymnDisplayNumber({ number: 72 })).toBe(72);
    expect(resolveHymnDisplayNumber({ number: 72, variant: 'a' })).toBe('72a');
  });
});

describe('compareHymnNumbers', () => {
  it('sorts variants between their base number and the following hymn', () => {
    const hymnNumbers = [
      { number: 73 },
      { number: 72, variant: 'b' },
      { number: 72, variant: 'a' },
      { number: 71 },
    ];

    expect(hymnNumbers.sort(compareHymnNumbers)).toEqual([
      { number: 71 },
      { number: 72, variant: 'a' },
      { number: 72, variant: 'b' },
      { number: 73 },
    ]);
  });
});

import { describe, expect, it } from '@jest/globals';
import {
  formatPositionedChords,
  formatPositionedChordTokens,
  transposeChordSymbol,
} from './transposeChordSheet';

describe('transposeChordSymbol', () => {
  it('transposes complex and inverted chords', () => {
    expect(transposeChordSymbol('C#m7(b5)/G#', 2)).toBe('D#m7(b5)/A#');
    expect(transposeChordSymbol('F7M', 2)).toBe('G7M');
  });

  it('returns the original spelling at offset zero', () => {
    expect(transposeChordSymbol('F#sus4', 0)).toBe('F#sus4');
  });
});

describe('formatPositionedChords', () => {
  it('keeps source columns while preventing transposed symbols from overlapping', () => {
    expect(
      formatPositionedChords(
        [
          { symbol: 'C', column: 2 },
          { symbol: 'F', column: 4 },
        ],
        1
      )
    ).toBe('  Db Gb');
  });
});

describe('formatPositionedChordTokens', () => {
  it('preserves spacing while returning interactive chord symbols', () => {
    expect(
      formatPositionedChordTokens(
        [
          { symbol: 'C', column: 2 },
          { symbol: 'F', column: 4 },
        ],
        1
      )
    ).toEqual([
      { leadingSpaces: '  ', symbol: 'Db' },
      { leadingSpaces: ' ', symbol: 'Gb' },
    ]);
  });
});

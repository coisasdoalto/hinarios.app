import { describe, expect, it } from '@jest/globals';
import { RenderableHymn } from '../domain/hymn/renderableHymn.types';
import { extractUniqueChordSymbols } from './extractChords';

const hymn: RenderableHymn = {
  editable: false,
  id: 'ev-1',
  number: '1',
  sections: [
    {
      id: 'section-1',
      lines: [
        {
          chords: [
            { column: 0, symbol: 'G' },
            { column: 4, symbol: 'C' },
          ],
          id: 'line-1',
          text: 'Linha um',
        },
        {
          chords: [
            { column: 0, symbol: 'G' },
            { column: 4, symbol: 'D' },
          ],
          id: 'line-2',
          text: 'Linha dois',
        },
      ],
      type: 'unnumbered',
    },
  ],
  title: 'Meu Prazer',
};

describe('extractUniqueChordSymbols', () => {
  it('preserves first appearance and removes duplicates', () => {
    expect(extractUniqueChordSymbols(hymn, 0)).toEqual(['G', 'C', 'D']);
  });

  it('extracts the symbols after transposition', () => {
    expect(extractUniqueChordSymbols(hymn, 2)).toEqual(['A', 'D', 'E']);
  });
});

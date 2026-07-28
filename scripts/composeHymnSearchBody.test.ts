import { expect, it } from '@jest/globals';
import { RenderableHymn } from '../domain/hymn/renderableHymn.types';
import { composeHymnSearchBody } from './composeHymnSearchBody';

it('indexes normalized lyrics without chord symbols', () => {
  const hymn: RenderableHymn = {
    id: 'ev-1',
    number: '1',
    title: 'Meu Prazer',
    editable: false,
    sections: [
      {
        id: 'section-1',
        type: 'stanza',
        number: 1,
        lines: [
          { id: 'line-1', text: 'Em espírito', chords: [{ symbol: 'G', column: 0 }] },
          { id: 'line-2', text: 'Em verdade' },
        ],
      },
    ],
  };

  expect(composeHymnSearchBody(hymn)).toBe('1. Em espírito\nEm verdade');
});

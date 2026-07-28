import { describe, expect, it } from '@jest/globals';
import { hymnDocumentSchema } from '../../schemas/hymn';
import { normalizeHymn } from './normalizeHymn';

describe('normalizeHymn', () => {
  it('normalizes a legacy hymn without changing its visible content', () => {
    const legacyHymn = hymnDocumentSchema.parse({
      number: '44A',
      title: 'Legado',
      lyrics: [{ type: 'stanza', number: 1, text: 'Linha 1\nLinha 2' }],
    });

    expect(normalizeHymn({ hymn: legacyHymn, hymnBookSlug: 'legacy-book' })).toMatchObject({
      id: 'legacy-book/44A',
      number: '44A',
      editable: true,
      sections: [
        {
          type: 'stanza',
          number: 1,
          lines: [{ text: 'Linha 1' }, { text: 'Linha 2' }],
        },
      ],
    });
  });

  it('normalizes a chord sheet as a non-editable musical hymn', () => {
    const chordSheetHymn = hymnDocumentSchema.parse({
      schemaVersion: 2,
      id: 'ev-1',
      number: 1,
      title: 'Meu Prazer',
      source: {
        format: 'obsidian-chords',
        content: 'TOM %G\n\nG\nEm espírito, em verdade',
      },
    });

    expect(normalizeHymn({ hymn: chordSheetHymn, hymnBookSlug: 'ignored-for-v2' })).toMatchObject({
      id: 'ev-1',
      editable: false,
      musical: { originalKey: 'G', transposable: true },
      sections: [{ lines: [{ text: 'Em espírito, em verdade' }] }],
    });
  });
});

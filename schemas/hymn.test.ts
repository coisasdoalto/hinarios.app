import { describe, expect, it } from '@jest/globals';
import { applyDefaultSchemaVersion, chordSheetHymnSchema, hymnDocumentSchema } from './hymn';

describe('hymn schemas', () => {
  const legacyHymn = {
    number: '44A',
    title: 'Legacy hymn',
    showStanzaNumbers: false,
    lyrics: [{ type: 'chorus' as const, text: 'Legacy lyrics' }],
  };

  it('applies schema version 1 without removing legacy fields', () => {
    expect(hymnDocumentSchema.parse(legacyHymn)).toEqual({
      ...legacyHymn,
      schemaVersion: 1,
    });
  });

  it('does not replace an explicit schema version', () => {
    const unsupportedHymn = { ...legacyHymn, schemaVersion: 3 };

    expect(applyDefaultSchemaVersion(unsupportedHymn)).toBe(unsupportedHymn);
  });

  it('validates an Obsidian chord-sheet hymn', () => {
    const chordSheetHymn = {
      schemaVersion: 2 as const,
      id: 'em-espirito-em-verdade-1',
      number: 1,
      title: 'Meu Prazer',
      source: {
        format: 'obsidian-chords' as const,
        content: 'TOM %G\n\nG\nEm espírito, em verdade',
      },
    };

    expect(chordSheetHymnSchema.parse(chordSheetHymn)).toEqual(chordSheetHymn);
    expect(hymnDocumentSchema.parse(chordSheetHymn)).toEqual(chordSheetHymn);
  });
});

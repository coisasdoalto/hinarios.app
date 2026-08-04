import { describe, expect, it } from '@jest/globals';
import { requirePiracicabaSourceDirectory } from './piracicabaHymnBook';

describe('requirePiracicabaSourceDirectory', () => {
  it('returns the configured vault path', () => {
    expect(requirePiracicabaSourceDirectory('/vault/piracicaba')).toBe('/vault/piracicaba');
  });

  it('rejects a missing vault path', () => {
    expect(() => requirePiracicabaSourceDirectory(undefined)).toThrow(
      'Invalid PIRACICABA_HYMN_BOOK_PATH "undefined"; expected a path to the Piracicaba Obsidian vault'
    );
  });
});

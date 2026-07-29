import { describe, expect, it } from '@jest/globals';
import {
  extractObsidianChordContent,
  parseChordSheetFileName,
  selectChordSheetMarkdownFileNames,
} from './parseChordSheetMarkdown';

describe('selectChordSheetMarkdownFileNames', () => {
  it('selects and sorts Markdown files', () => {
    expect(selectChordSheetMarkdownFileNames(['notes.txt', '2 Second.md', '1 First.md'])).toEqual([
      '1 First.md',
      '2 Second.md',
    ]);
  });
});

describe('parseChordSheetFileName', () => {
  it('extracts the number and removes review markers from the title', () => {
    expect(parseChordSheetFileName('10 Exaltar-Te-ei ✔️🆗.md')).toEqual({
      number: 10,
      title: 'Exaltar-Te-ei',
    });
  });

  it('preserves title punctuation that is not a review marker', () => {
    expect(parseChordSheetFileName('55 Minh_alma Engrandece ao Senhor 🆗.md')).toEqual({
      number: 55,
      title: 'Minh_alma Engrandece ao Senhor',
    });
  });

  it('ignores emojis anywhere in the imported title', () => {
    expect(parseChordSheetFileName('55 🎵 Louvor 🙌 da Igreja 🆗.md')).toEqual({
      number: 55,
      title: 'Louvor da Igreja',
    });
  });

  it('extracts and normalizes an optional hymn variant', () => {
    expect(parseChordSheetFileName('72.A Maranata 🆗.md')).toEqual({
      number: 72,
      variant: 'a',
      title: 'Maranata',
    });
  });

  it('accepts a filename without a hymn number', () => {
    expect(parseChordSheetFileName('Meu Prazer 🆗.md')).toEqual({
      title: 'Meu Prazer',
    });
  });

  it('rejects a filename without the Markdown extension', () => {
    expect(() => parseChordSheetFileName('Meu Prazer.txt')).toThrow(
      'Invalid chord-sheet filename "Meu Prazer.txt"; expected "[<number>[.<variant>] ]<title>.md"'
    );
  });
});

describe('extractObsidianChordContent', () => {
  it('extracts a closed chords block and ignores trailing Markdown', () => {
    const sourceMarkdown =
      '```chords\nTOM %G\n\nG\nEm espírito, em verdade\n```\n<div>page break</div>';

    expect(extractObsidianChordContent(sourceMarkdown, '1 Meu Prazer.md')).toBe(
      'TOM %G\n\nG\nEm espírito, em verdade'
    );
  });

  it('accepts an unclosed chords block through the end of the file', () => {
    const sourceMarkdown = '```chords\nTOM %E\n\nA\nAcredito em Jesus Cristo';

    expect(extractObsidianChordContent(sourceMarkdown, '7 Acredito.md')).toBe(
      'TOM %E\n\nA\nAcredito em Jesus Cristo'
    );
  });

  it('ignores Markdown metadata before the chords block', () => {
    const sourceMarkdown =
      '*Corinhos e Cânticos, Nº 7*\n```chords\nTOM %E\n\nE\nRazão de viver\n```';

    expect(extractObsidianChordContent(sourceMarkdown, 'Razão de Viver.md')).toBe(
      'TOM %E\n\nE\nRazão de viver'
    );
  });

  it('rejects Markdown without the expected chords fence', () => {
    expect(() => extractObsidianChordContent('TOM %G', '1 Meu Prazer.md')).toThrow(
      'Invalid chord sheet "1 Meu Prazer.md"; expected an opening ```chords fence'
    );
  });
});

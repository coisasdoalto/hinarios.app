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

  it('rejects a filename without the expected numeric prefix', () => {
    expect(() => parseChordSheetFileName('Meu Prazer.md')).toThrow(
      'Invalid chord-sheet filename "Meu Prazer.md"; expected "<number> <title>.md"'
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

  it('rejects Markdown without the expected chords fence', () => {
    expect(() => extractObsidianChordContent('TOM %G', '1 Meu Prazer.md')).toThrow(
      'Invalid chord sheet "1 Meu Prazer.md"; expected an opening ```chords fence'
    );
  });
});

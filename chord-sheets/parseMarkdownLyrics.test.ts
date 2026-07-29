import { describe, expect, it } from '@jest/globals';
import { parseMarkdownLyrics } from './parseMarkdownLyrics';

describe('parseMarkdownLyrics', () => {
  it('parses asterisk and underscore emphasis markers', () => {
    expect(parseMarkdownLyrics('Eu **te** _adoro_')).toMatchObject({
      text: 'Eu te adoro',
      segments: [
        { text: 'Eu ' },
        { text: 'te', bold: true },
        { text: ' ' },
        { text: 'adoro', italic: true },
      ],
    });
  });

  it('parses triple markers as bold and italic', () => {
    expect(parseMarkdownLyrics('Para ***sempre***')).toMatchObject({
      text: 'Para sempre',
      segments: [{ text: 'Para ' }, { text: 'sempre', bold: true, italic: true }],
    });
  });

  it('accepts both Markdown delimiter styles', () => {
    expect(parseMarkdownLyrics('__forte__ e *suave*')).toMatchObject({
      text: 'forte e suave',
      segments: [{ text: 'forte', bold: true }, { text: ' e ' }, { text: 'suave', italic: true }],
    });
  });

  it('preserves unmatched markers as literal text', () => {
    expect(parseMarkdownLyrics('Minh_alma *sem fechamento')).toEqual({
      markerColumns: [],
      text: 'Minh_alma *sem fechamento',
    });
  });
});

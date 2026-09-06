import { describe, expect, it } from '@jest/globals';
import { render, screen, within } from '@testing-library/react';

import { Hymn } from '../../schemas/hymn';
import { HymnLyrics, splitLyricsIntoColumns } from './HymnLyrics';

const lyrics: Hymn['lyrics'] = [
  { type: 'stanza', number: 1, text: 'Primeira estrofe' },
  { type: 'stanza', number: 2, text: 'Segunda estrofe' },
  { type: 'stanza', number: 3, text: 'Terceira estrofe' },
  { type: 'stanza', number: 4, text: 'Quarta estrofe' },
];

describe('HymnLyrics', () => {
  it('fills the first grid column before the second', () => {
    render(<HymnLyrics fontSize="md" layout="grid" lyrics={lyrics} />);

    const columns = screen.getAllByTestId('lyrics-column');

    expect(columns).toHaveLength(2);
    expect(
      within(columns[0])
        .getAllByText(/estrofe/)
        .map((item) => item.textContent)
    ).toEqual(['1.Primeira estrofe', '2.Segunda estrofe']);
    expect(
      within(columns[1])
        .getAllByText(/estrofe/)
        .map((item) => item.textContent)
    ).toEqual(['3.Terceira estrofe', '4.Quarta estrofe']);
  });

  it('keeps every stanza in one column in normal layout', () => {
    render(<HymnLyrics fontSize="md" layout="normal" lyrics={lyrics} />);

    expect(screen.getByTestId('hymn-lyrics').getAttribute('data-layout')).toBe('normal');
    const columns = screen.getAllByTestId('lyrics-column');

    expect(columns).toHaveLength(1);
    expect(columns[0].style.justifySelf).toBe('center');
    expect(columns[0].style.textAlign).toBe('left');
  });

  it('puts an odd extra item at the bottom of the first column', () => {
    expect(splitLyricsIntoColumns([1, 2, 3, 4, 5])).toEqual([
      [1, 2, 3],
      [4, 5],
    ]);
  });
});

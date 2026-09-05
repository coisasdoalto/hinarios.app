import { describe, expect, it } from '@jest/globals';

import { otherSongSchema } from './otherSong';

const song = {
  title: 'O Senhor é o meu pastor',
  lyrics: [{ type: 'unnumbered_stanza' as const, text: 'Nada me faltará.' }],
};

describe('otherSongSchema', () => {
  it('accepts a song without a number', () => {
    expect(otherSongSchema.parse(song)).toEqual(song);
  });

  it('rejects numbered songs', () => {
    expect(() => otherSongSchema.parse({ ...song, number: 1 })).toThrow();
  });
});

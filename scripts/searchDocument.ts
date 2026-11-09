import { Hymn } from '../schemas/hymn';

const composeStanzaText = (stanza?: { number: string | number; text: string }) => {
  if (!stanza) {
    return null;
  }

  return `${stanza.number}. ${stanza.text}`;
};

/**
 * Flattens a hymn's lyrics into the single body text used by the search index.
 * @example composeLyrics({ lyrics: [{ type: 'stanza', number: 1, text: 'Olá' }] }); // '1. Olá'
 */
export const composeLyrics = ({ lyrics }: Pick<Hymn, 'lyrics'>): string => {
  return lyrics
    .map((lyric) => {
      if (lyric.type === 'stanza') return composeStanzaText(lyric);

      return lyric.text;
    })
    .join('\n\n');
};

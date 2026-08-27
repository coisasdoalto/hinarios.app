import { Hymn } from '../../schemas/hymn';

export type SlideScreen = Hymn['lyrics'][number];

/**
 * Keeps every lyric block as one slide while preserving the hymn's order.
 *
 * @example composeSlideScreens([{ type: 'chorus', text: 'Glória' }]);
 */
export function composeSlideScreens(lyrics: Hymn['lyrics']): SlideScreen[] {
  const chorusScreens = lyrics.filter((lyric) => lyric.type === 'chorus');
  const hasStanza = lyrics.some((lyric) => lyric.type !== 'chorus');
  if (chorusScreens.length === 0 || !hasStanza) return lyrics;

  return lyrics.reduce<SlideScreen[]>((screens, lyric) => {
    if (lyric.type === 'chorus') return screens;

    screens.push(lyric, ...chorusScreens);
    return screens;
  }, []);
}

/**
 * Returns the short context label shown below the hymn title.
 *
 * @example getSlideLabel({ type: 'stanza', number: 2, text: '...' }); // 'Estrofe 2'
 */
export function getSlideLabel(screen: SlideScreen): string {
  if (screen.type === 'chorus') return 'Estribilho';
  if (screen.type === 'stanza') return `Estrofe ${screen.number}`;

  return 'Estrofe';
}

/**
 * Selects the default text from a lyric variation without rendering its controls.
 *
 * @example getSlideText('Vem {cedo|logo} Senhor'); // 'Vem cedo Senhor'
 */
export function getSlideText(text: string): string {
  return text.replace(/\{([^{}]*)\}/g, (_match, options: string) => options.split('|')[0]);
}

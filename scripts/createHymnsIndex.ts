import slugify from 'slugify';
import { HymnsIndex } from '../schemas/hymnsIndex';

type HymnIndexSource = {
  number: string | number;
  subtitle?: string;
  title: string;
};

/**
 * Creates the shared navigation and search metadata for a collection of hymns.
 *
 * @example createHymnsIndex([{ number: 1, title: 'Meu Prazer' }])
 */
export function createHymnsIndex(hymns: HymnIndexSource[]): HymnsIndex {
  return hymns.map((hymn) => ({
    number: hymn.number,
    title: hymn.title,
    subtitle: hymn.subtitle,
    slug: `${hymn.number}-${slugify(hymn.title)}`,
  }));
}

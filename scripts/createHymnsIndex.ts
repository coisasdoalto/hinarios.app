import slugify from 'slugify';
import { resolveHymnDisplayNumber } from '../domain/hymn/hymnNumber';
import { HymnsIndex } from '../schemas/hymnsIndex';

type HymnIndexSource = {
  number: string | number;
  subtitle?: string;
  title: string;
  variant?: string;
};

/**
 * Creates the shared navigation and search metadata for a collection of hymns.
 *
 * @example createHymnsIndex([{ number: 1, title: 'Meu Prazer' }])
 */
export function createHymnsIndex(hymns: HymnIndexSource[]): HymnsIndex {
  return hymns.map((hymn) => {
    const displayNumber = resolveHymnDisplayNumber(hymn);
    return {
      number: displayNumber,
      title: hymn.title,
      subtitle: hymn.subtitle,
      slug: `${displayNumber}-${slugify(hymn.title)}`,
    };
  });
}

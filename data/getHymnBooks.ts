import { readdir } from 'fs/promises';
import { HIDDEN_HYMN_BOOK_SLUGS, OTHER_SONGS_SLUG } from '../contants';
import getHymnBookInfo from './getHymnBookInfo';
import { joinDataPath } from './joinDataPath';
import getHymnsIndex from './getHymnsIndex';

/**
 * Lists the hymn books that the public static build may expose.
 * Hidden books (HC, pending rights clearance) are left out unless `includeHidden` is set.
 * @example getHymnBooks({ includeHidden: true }); // includes hinos-e-canticos
 */
const getHymnBooks = async (options?: { withIndex?: boolean; includeHidden?: boolean }) => {
  const withIndex = options?.withIndex ?? true;
  const includeHidden = options?.includeHidden ?? false;

  const hymnBooksSlugs = (await readdir(joinDataPath(''))).filter(
    (slug) => slug !== OTHER_SONGS_SLUG && (includeHidden || !HIDDEN_HYMN_BOOK_SLUGS.includes(slug))
  );

  const hymnBooks = await Promise.all(
    hymnBooksSlugs.map(async (slug) => ({
      slug,
      name: (await getHymnBookInfo(slug)).name,
      index: withIndex ? await getHymnsIndex(slug) : undefined,
    }))
  );

  return hymnBooks;
};

export default getHymnBooks;

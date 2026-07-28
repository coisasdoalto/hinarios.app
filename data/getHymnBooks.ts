import { readdir } from 'fs/promises';
import getHymnBookInfo from './getHymnBookInfo';
import { joinDataPath } from './joinDataPath';
import getHymnsIndex from './getHymnsIndex';

const getHymnBooks = async (options?: { withIndex: boolean }) => {
  const withIndex = options?.withIndex ?? true;

  const hymnBooksSlugs = await readdir(joinDataPath(''));

  const hymnBooks = await Promise.all(
    hymnBooksSlugs.map(async (slug) => {
      const hymnBookInfo = await getHymnBookInfo(slug);

      return {
        slug,
        ...hymnBookInfo,
        index: withIndex ? await getHymnsIndex(slug) : undefined,
      };
    })
  );

  return hymnBooks;
};

export default getHymnBooks;

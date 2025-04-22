import { readdir } from 'fs/promises';
import getHymnBookInfo from './getHymnBookInfo';
import { joinDataPath } from './joinDataPath';
import getHymnsIndex from './getHymnsIndex';

const getHymnBooks = async () => {
  const hymnBooksSlugs = await readdir(joinDataPath(''));

  const hymnBooks = await Promise.all(
    hymnBooksSlugs.map(async (slug) => ({
      slug,
      name: (await getHymnBookInfo(slug)).name,
      index: (await getHymnsIndex(slug)),
    }))
  );

  return hymnBooks;
};

export default getHymnBooks;

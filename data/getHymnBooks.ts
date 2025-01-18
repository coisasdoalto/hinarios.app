import { readdir } from 'fs/promises';
import getHymnBookInfo from './getHymnBookInfo';
import { joinDataPath } from './joinDataPath';

const getHymnBooks = async () => {
  const hymnBooksSlugs = await readdir(joinDataPath(''));

  const hymnBooks = await Promise.all(
    hymnBooksSlugs.map(async (slug) => ({
      slug,
      name: (await getHymnBookInfo(slug)).name,
    }))
  );

  return hymnBooks;
};

export default getHymnBooks;

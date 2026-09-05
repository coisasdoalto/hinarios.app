import { existsSync } from 'fs';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import getHymnBooks from '../data/getHymnBooks';
import getHymnsIndex from '../data/getHymnsIndex';
import getOtherSongsIndex from '../data/getOtherSongsIndex';
import { OTHER_SONGS_SLUG } from '../contants';

async function generatePathsForPrecache() {
  const hymnBooks = await getHymnBooks();

  const hymnBookPaths = (
    await Promise.all(
      hymnBooks.map(async (hymnBook) => {
        const hymnsIndex = await getHymnsIndex(hymnBook.slug);

        const hymnBookPage = `/${hymnBook.slug}/`;

        const paths = hymnsIndex.map(({ slug }) => `/${hymnBook.slug}/${slug}/`);

        return [hymnBookPage, ...paths];
      })
    )
  ).flat();

  const otherSongs = await getOtherSongsIndex();
  const otherSongPaths = [
    `/${OTHER_SONGS_SLUG}/`,
    ...otherSongs.map(({ slug }) => `/${OTHER_SONGS_SLUG}/${slug}/`),
  ];
  const allPaths = [...hymnBookPaths, ...otherSongPaths];

  if (!existsSync('tmp')) {
    await mkdir('tmp');
  }

  await writeFile(path.join('tmp', 'pathsForPrecache.json'), JSON.stringify(allPaths, null, 2));

  return allPaths;
}

generatePathsForPrecache();

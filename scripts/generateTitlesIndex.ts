import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { OTHER_SONGS_NAME, OTHER_SONGS_SLUG } from '../contants';
import getHymnBooks from '../data/getHymnBooks';
import getOtherSongsIndex from '../data/getOtherSongsIndex';

/**
 * Writes the public titles used to label favorites, so the client never fetches each hymn.
 * Hidden books are excluded because getHymnBooks leaves them out by default.
 */
async function generateTitlesIndex() {
  const hymnBooks = await getHymnBooks();
  const otherSongs = await getOtherSongsIndex();

  const titles = Object.fromEntries(
    hymnBooks.map((hymnBook) => [
      hymnBook.slug,
      {
        name: hymnBook.name,
        hymns: Object.fromEntries((hymnBook.index ?? []).map(({ slug, title }) => [slug, title])),
      },
    ])
  );

  titles[OTHER_SONGS_SLUG] = {
    name: OTHER_SONGS_NAME,
    hymns: Object.fromEntries(otherSongs.map(({ slug, title }) => [slug, title])),
  };

  await mkdir(path.join('public', 'data'), { recursive: true });
  await writeFile(path.join('public', 'data', 'titles.json'), JSON.stringify(titles));
}

generateTitlesIndex();

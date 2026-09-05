import { readdir, writeFile } from 'fs/promises';
import path from 'path';
import slugify from 'slugify';
import getHymnBooks from '../data/getHymnBooks';
import getParsedData from '../data/getParsedData';
import { joinDataPath } from 'data/joinDataPath';
import { hymnSchema } from '../schemas/hymn';
import { OTHER_SONGS_SLUG } from '../contants';
import { otherSongSchema } from '../schemas/otherSong';

async function generateOtherSongsIndex() {
  const filenames = (await readdir(joinDataPath(OTHER_SONGS_SLUG))).filter(
    (filename) => filename !== 'index.json' && filename.endsWith('.json')
  );

  const songs = await Promise.all(
    filenames.map(async (filename) => ({
      ...(await getParsedData({
        filePath: path.join(OTHER_SONGS_SLUG, filename),
        schema: otherSongSchema,
      })),
      slug: path.basename(filename, '.json'),
    }))
  );

  const index = songs
    .sort((current, next) => current.title.localeCompare(next.title, 'pt-BR'))
    .map(({ title, subtitle, slug }) => ({
      title,
      ...(subtitle ? { subtitle } : {}),
      slug,
    }));

  await writeFile(
    joinDataPath(path.join(OTHER_SONGS_SLUG, 'index.json')),
    JSON.stringify(index, null, 2)
  );
}

async function generateHymnsIndex() {
  const hymnBooks = await getHymnBooks({ withIndex: false });

  await Promise.all(
    hymnBooks.map(async (hymnBook) => {
      const hymnFilenames = await Promise.all(
        (
          await readdir(joinDataPath(hymnBook.slug))
        ).filter((hymnFilename) => /\d.*\.json/.test(hymnFilename))
      );

      const hymns = await (
        await Promise.all(
          hymnFilenames.map(async (hymnFilename) =>
            getParsedData({
              filePath: path.join(hymnBook.slug, hymnFilename),
              schema: hymnSchema,
            })
          )
        )
      ).sort(
        (current, next) => parseInt(String(current.number), 10) - parseInt(String(next.number), 10)
      );

      const index = hymns.map((hymn) => ({
        number: hymn.number,
        title: hymn.title,
        subtitle: hymn.subtitle,
        slug: `${hymn.number}-${slugify(hymn.title)}`,
      }));

      await writeFile(
        joinDataPath(path.join(hymnBook.slug, 'index.json')),
        JSON.stringify(index, null, 2)
      );
    })
  );

  await generateOtherSongsIndex();
}

generateHymnsIndex();

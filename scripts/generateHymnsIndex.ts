import { readdir, writeFile } from 'fs/promises';
import path from 'path';
import slugify from 'slugify';
import getHymnBooks from '../data/getHymnBooks';
import getParsedData from '../data/getParsedData';
import { joinDataPath } from 'data/joinDataPath';
import { hymnSchema } from '../schemas/hymn';

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
}

generateHymnsIndex();

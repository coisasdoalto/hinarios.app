import { readdir, writeFile } from 'fs/promises';
import path from 'path';
import getHymnBooks from '../data/getHymnBooks';
import getParsedData from '../data/getParsedData';
import { joinDataPath } from 'data/joinDataPath';
import { compareHymnNumbers } from '../domain/hymn/hymnNumber';
import { hymnDocumentSchema } from '../schemas/hymn';
import { createHymnsIndex } from './createHymnsIndex';

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
              schema: hymnDocumentSchema,
            })
          )
        )
      ).sort(compareHymnNumbers);

      const index = createHymnsIndex(hymns);

      await writeFile(
        joinDataPath(path.join(hymnBook.slug, 'index.json')),
        JSON.stringify(index, null, 2)
      );
    })
  );
}

generateHymnsIndex();

import flexsearch from 'flexsearch';
import { readdir } from 'fs/promises';
import path from 'path';
import slugify from 'slugify';
import getHymnBooks from '../data/getHymnBooks';
import getParsedData from '../data/getParsedData';
import { joinDataPath } from 'data/joinDataPath';
import { Hymn, hymnSchema } from '../schemas/hymn';
import { writeFileSync } from 'fs';

const index = new flexsearch.Document({
  document: {
    id: 'id',
    index: ['number', 'title', 'body'],
    store: true,
  },
});

const composeStanzaText = (stanza?: { number: string | number; text: string }) => {
  if (!stanza) {
    return null;
  }

  return `${stanza.number}. ${stanza.text}`;
};

const composeLyrics = (hymn: Hymn): string => {
  return hymn.lyrics
    .map((lyric) => {
      if (lyric.type === 'stanza') return composeStanzaText(lyric);

      return lyric.text;
    })
    .join('\n\n');
};

async function generateHymnsIndex() {
  const hymnBooks = await getHymnBooks();

  await Promise.all(
    hymnBooks.map(async (hymnBook) => {
      const hymnFilenames = await Promise.all(
        (
          await readdir(joinDataPath(hymnBook.slug))
        ).filter((hymnFilename) => /\d.*\.json/.test(hymnFilename))
      );

      (
        await Promise.all(
          hymnFilenames.map(async (hymnFilename) =>
            getParsedData({
              filePath: path.join(hymnBook.slug, hymnFilename),
              schema: hymnSchema,
            })
          )
        )
      )
        .sort(
          (current, next) =>
            parseInt(String(current.number), 10) - parseInt(String(next.number), 10)
        )
        .map((hymn) => ({
          id: `${hymnBook.slug}/${hymn.number}-${slugify(hymn.title)}`,
          title: `${hymn.number}. ${hymn.title}`,
          body: composeLyrics(hymn),
          hymnBookName: hymnBook.name,
        }))
        .forEach((hymn) => index.add(hymn.id, hymn));
    })
  );

  // Quick test
  console.log(
    JSON.stringify(
      index.search({
        query: 'só tristeza',
        enrich: true,
      })
    )
  );

  const keys: string[] = [];

  await index.export(function (key, data) {
    if (data) {
      keys.push(String(key));
      writeFileSync(destinationPath(`${key}.json`), JSON.stringify(data));
    }

    return;
  });

  writeFileSync(destinationPath(`_keys.json`), JSON.stringify(keys));
}

const destinationPath = (fileName: string) => path.join(__dirname, '..', 'search', fileName);

generateHymnsIndex();

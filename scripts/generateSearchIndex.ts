import elasticlunr from 'elasticlunr';
import { readdir, writeFile } from 'fs/promises';
import path from 'path';
import slugify from 'slugify';
import getHymnBooks from '../data/getHymnBooks';
import getParsedData, { joinDataPath } from '../data/getParsedData';
import { Hymn, hymnSchema } from '../schemas/hymn';

// eslint-disable-next-line func-names
const index = elasticlunr<{ id: string; title: string; body: string }>(function () {
  this.setRef('id');
  this.addField('title');
  this.addField('body');
  this.saveDocument(true);
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
          id: `${hymnBook.slug}/${hymn.number}`,
          hymnBook,
          number: hymn.number,
          title: `${hymn.number}. ${hymn.title}`,
          body: composeLyrics(hymn),
          slug: `${hymn.number}-${slugify(hymn.title)}`,
        }))
        .forEach((hymn) => index.addDoc(hymn));
    })
  );

  await writeFile(path.join(__dirname, '..', 'search', 'searchIndex.json'), JSON.stringify(index));
}

generateHymnsIndex();

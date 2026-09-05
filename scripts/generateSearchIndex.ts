import flexsearch from 'flexsearch';
import { readdir } from 'fs/promises';
import path from 'path';
import slugify from 'slugify';
import getHymnBooks from '../data/getHymnBooks';
import getParsedData from '../data/getParsedData';
import { joinDataPath } from 'data/joinDataPath';
import { Hymn, hymnSchema } from '../schemas/hymn';
import { writeFileSync } from 'fs';
import { OTHER_SONGS_NAME, OTHER_SONGS_SLUG } from '../contants';
import getOtherSong from '../data/getOtherSong';
import getOtherSongsIndex from '../data/getOtherSongsIndex';

const index = new flexsearch.Document({
  document: {
    id: 'id',
    index: ['number', 'title', 'body'],
    store: true,
  },
  tokenize: 'forward',
});

const composeStanzaText = (stanza?: { number: string | number; text: string }) => {
  if (!stanza) {
    return null;
  }

  return `${stanza.number}. ${stanza.text}`;
};

const composeLyrics = ({ lyrics }: Pick<Hymn, 'lyrics'>): string => {
  return lyrics
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

  const otherSongs = await getOtherSongsIndex();
  const otherSongDocuments = await Promise.all(
    otherSongs.map(async (song) => {
      const result = await getOtherSong(song.slug);
      if (!result) return null;

      return {
        id: `${OTHER_SONGS_SLUG}/${song.slug}`,
        title: song.title,
        body: composeLyrics(result.content),
        hymnBookName: OTHER_SONGS_NAME,
      };
    })
  );

  otherSongDocuments.forEach((song) => {
    if (song) index.add(song.id, song);
  });

  // // Quick test
  // console.log(
  //   JSON.stringify(
  //     index.search({
  //       query: 'só tristeza',
  //       enrich: true,
  //     })
  //   )
  // );

  // Quick test 2
  console.log(
    JSON.stringify(
      index.search({
        query: 'chuva',
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

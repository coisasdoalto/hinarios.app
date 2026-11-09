import flexsearch from 'flexsearch';
import { mkdir, readdir, writeFile } from 'fs/promises';
import path from 'path';
import slugify from 'slugify';
import { HC_HYMN_BOOK_SLUG } from '../contants';
import getHymnBookInfo from '../data/getHymnBookInfo';
import getHymnsIndex from '../data/getHymnsIndex';
import getParsedData from '../data/getParsedData';
import { joinDataPath } from '../data/joinDataPath';
import { hymnSchema } from '../schemas/hymn';
import { composeLyrics } from './searchDocument';

/**
 * Packs the HC book into one JSON file for the protected Pages Function.
 * The output stays under `functions/`, so it is bundled into the Function and never copied
 * to the public static output.
 */
async function generateHcData() {
  const hymnBookInfo = await getHymnBookInfo(HC_HYMN_BOOK_SLUG);
  const index = await getHymnsIndex(HC_HYMN_BOOK_SLUG);

  const hymnFilenames = (await readdir(joinDataPath(HC_HYMN_BOOK_SLUG))).filter((filename) =>
    /^\d.*\.json$/.test(filename)
  );

  const hymns: Record<string, unknown> = {};
  const search = new flexsearch.Document({
    document: {
      id: 'id',
      index: ['number', 'title', 'body'],
      store: true,
    },
    tokenize: 'forward',
  });

  await Promise.all(
    hymnFilenames.map(async (filename) => {
      const hymn = await getParsedData({
        filePath: path.join(HC_HYMN_BOOK_SLUG, filename),
        schema: hymnSchema,
      });

      hymns[path.basename(filename, '.json')] = hymn;

      search.add(`${HC_HYMN_BOOK_SLUG}/${hymn.number}-${slugify(hymn.title)}`, {
        id: `${HC_HYMN_BOOK_SLUG}/${hymn.number}-${slugify(hymn.title)}`,
        title: `${hymn.number}. ${hymn.title}`,
        body: composeLyrics(hymn),
        hymnBookName: hymnBookInfo.name,
      });
    })
  );

  const searchShards: Record<string, unknown> = {};
  const searchKeys: string[] = [];

  await search.export((key, data) => {
    if (data) {
      searchKeys.push(String(key));
      searchShards[String(key)] = data;
    }
  });

  await mkdir(path.join('functions', 'generated'), { recursive: true });
  await writeFile(
    path.join('functions', 'generated', 'hc-data.json'),
    JSON.stringify({ hymnBookInfo, index, hymns, searchKeys, searchShards })
  );
}

generateHcData();

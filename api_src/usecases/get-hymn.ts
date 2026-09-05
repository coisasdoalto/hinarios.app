import path from 'node:path';

import { fs } from 'zx';

import { OTHER_SONGS_NAME, OTHER_SONGS_SLUG } from 'contants';
import getParsedData from 'data/getParsedData';
import { hymnSchema } from 'schemas/hymn';
import { hymnBookInfoSchema } from 'schemas/hymnBookInfo';
import { otherSongSchema } from 'schemas/otherSong';

type Params = {
  hymnBook: string;
  hymnIdentifier: string;
};

class GetHymnUsecase {
  async execute({ hymnBook, hymnIdentifier }: Params) {
    const collectionPath = path.resolve('hymnsData', hymnBook);
    const songPath = path.resolve(collectionPath, `${hymnIdentifier}.json`);

    if (!songPath.startsWith(`${collectionPath}${path.sep}`) || !(await fs.exists(songPath))) {
      return null;
    }

    if (hymnBook === OTHER_SONGS_SLUG) {
      const song = await getParsedData({
        filePath: path.join(hymnBook, `${hymnIdentifier}.json`),
        schema: otherSongSchema.pick({ title: true }),
      });

      return { ...song, hymnBook: { name: OTHER_SONGS_NAME } };
    }

    const hymn = await getParsedData({
      filePath: path.join(hymnBook, `${hymnIdentifier}.json`),
      schema: hymnSchema.pick({ title: true }),
    });
    const hymnBookData = await getParsedData({
      filePath: path.join(hymnBook, 'hymnBookInfo.json'),
      schema: hymnBookInfoSchema,
    });

    return { ...hymn, hymnBook: hymnBookData };
  }
}

export const getHymnUsecase = new GetHymnUsecase();

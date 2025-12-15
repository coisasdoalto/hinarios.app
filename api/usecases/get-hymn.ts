import path from 'node:path';

import { fs } from 'zx';

import getParsedData from 'data/getParsedData';
import { hymnSchema } from 'schemas/hymn';
import { hymnBookInfoSchema } from 'schemas/hymnBookInfo';

type Params = {
  hymnBook: string;
  hymnNumber: string;
};

class GetHymnUsecase {
  async execute({ hymnBook, hymnNumber }: Params) {
    const hymnDataFile = path.resolve('hymnsData', hymnBook, `${hymnNumber}.json`);

    const hymnDataFileExists = await fs.exists(hymnDataFile);

    if (!hymnDataFileExists) return null;

    const hymnData = await getParsedData({
      filePath: path.join(hymnBook, `${hymnNumber}.json`),
      schema: hymnSchema.pick({
        title: true,
      }),
    });

    const hymnBookData = await getParsedData({
      filePath: path.join(hymnBook, 'hymnBookInfo.json'),
      schema: hymnBookInfoSchema,
    });

    return { ...hymnData, hymnBook: hymnBookData };
  }
}

export const getHymnUsecase = new GetHymnUsecase();

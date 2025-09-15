import { existsSync } from 'node:fs';
import path from 'node:path';

import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

import getParsedData from 'data/getParsedData';
import { hymnSchema } from 'schemas/hymn';
import { hymnBookInfoSchema } from 'schemas/hymnBookInfo';

const hymnsApp = new Hono();

hymnsApp.get('/', (c) => c.json({ status: 'ok' }));

hymnsApp.get(
  '/:hymnBook/:hymnNumber/',
  zValidator(
    'param',
    z.object({
      hymnNumber: z.coerce.number(),
      hymnBook: z.string(),
    })
  ),
  async (c) => {
    const { hymnBook, hymnNumber } = await c.req.valid('param');

    const hymnDataFile = path.resolve('hymnsData', hymnBook, `${hymnNumber}.json`);

    console.log(hymnDataFile);

    const hymnDataFileExists = existsSync(hymnDataFile);

    if (!hymnDataFileExists) {
      c.status(404);

      return c.json({ error: 'Hymn not found' });
    }

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

    return c.json({ ...hymnData, hymnBook: hymnBookData });
  }
);

export { hymnsApp };

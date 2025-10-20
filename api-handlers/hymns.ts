import { existsSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';

import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import slugify from 'slugify';
import { z } from 'zod';

import getParsedData from 'data/getParsedData';
import { hymnSchema } from 'schemas/hymn';
import { hymnBookInfoSchema } from 'schemas/hymnBookInfo';
import { adminAuthMiddleware } from './middleware/adminAuth';

const hymnsApp = new Hono();

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
    const { hymnBook, hymnNumber } = c.req.valid('param');

    const hymnDataFile = path.resolve('hymnsData', hymnBook, `${hymnNumber}.json`);

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

hymnsApp.patch(
  '/:hymnBook/:hymnNumber/',
  adminAuthMiddleware,
  zValidator(
    'param',
    z.object({
      hymnNumber: z.coerce.number(),
      hymnBook: z.string(),
    })
  ),
  zValidator(
    'json',
    hymnSchema.pick({
      lyrics: true,
    })
  ),
  async (c) => {
    const { hymnBook, hymnNumber } = c.req.valid('param');
    const { lyrics } = c.req.valid('json');

    const hymnDataFile = path.resolve('hymnsData', hymnBook, `${hymnNumber}.json`);

    const hymnDataFileExists = existsSync(hymnDataFile);

    if (!hymnDataFileExists) {
      c.status(404);

      return c.json({ error: 'Hymn not found' });
    }

    const existingHymnData = await getParsedData({
      filePath: path.join(hymnBook, `${hymnNumber}.json`),
      schema: hymnSchema,
    });

    const updatedHymnData = {
      ...existingHymnData,
      lyrics,
    };

    const hymnSlug = `${hymnNumber}-${slugify(existingHymnData.title)}`;

    await writeFile(hymnDataFile, JSON.stringify(updatedHymnData, null, 2));

    await c.env.outgoing.revalidate(`/${hymnBook}/${hymnSlug}/`);

    return c.body(null, 202);
  }
);

export { hymnsApp };

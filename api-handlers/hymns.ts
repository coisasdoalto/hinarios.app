import path from 'node:path';

import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import { fs } from 'zx';

import getParsedData from 'data/getParsedData';
import { storage } from 'firebase';
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

    const hymnDataFileExists = await fs.exists(hymnDataFile);

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
      title: true,
      subtitle: true,
      lyrics: true,
    })
  ),
  async (c) => {
    const { hymnBook, hymnNumber } = c.req.valid('param');
    const { title, subtitle, lyrics } = c.req.valid('json');

    const hymnFilePath = path.join(hymnBook, `${hymnNumber}.json`);
    const resolvedHymnDataPath = path.resolve('hymnsData', hymnFilePath);

    const hymnDataFileExists = await fs.exists(resolvedHymnDataPath);

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
      title,
      subtitle,
      lyrics,
    };

    const firebaseBucket = storage.bucket();

    await firebaseBucket.file(hymnFilePath).save(JSON.stringify(updatedHymnData, null, 2), {
      contentType: 'application/json',
    });

    return c.body(null, 202);
  }
);

export { hymnsApp };

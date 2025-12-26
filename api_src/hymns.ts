import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

import { hymnSchema } from 'schemas/hymn';
import { adminAuthMiddleware } from './middleware/adminAuth';
import { getHymnUsecase } from './usecases/get-hymn';
import { updateHymnUsecase } from './usecases/update-hymn';

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

    const hymn = await getHymnUsecase.execute({ hymnBook, hymnNumber });

    if (!hymn) {
      c.status(404);
      return c.json({ error: 'Hymn not found' });
    }

    return c.json(hymn);
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
    hymnSchema
      .pick({
        title: true,
        subtitle: true,
        lyrics: true,
      })
      .extend({
        message: z.string().optional(),
      })
  ),
  async (c) => {
    const { hymnBook, hymnNumber } = c.req.valid('param');
    const { title, subtitle, lyrics, message } = c.req.valid('json');

    try {
      await updateHymnUsecase.execute({
        hymnBook,
        hymnNumber,
        title,
        subtitle,
        lyrics,
        message,
      });

      return c.body(null, 202);
    } catch (error) {
      if (error instanceof Error && error.cause === 'HymnNotFound') {
        c.status(404);
        return c.json({ error: 'Hymn not found' });
      }

      throw error;
    }
  }
);

export { hymnsApp };

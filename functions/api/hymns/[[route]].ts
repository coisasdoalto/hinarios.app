import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';

import { resolveVerifiedEmail } from '../../../api_src/firebaseAuth';
import {
  createHymnRelease,
  readHymnFile,
  writeHymnFile,
} from '../../../api_src/hymnEditing/googleServices';
import type { EditorEnv } from '../../../api_src/hymnEditing/googleServices';
import { hymnChanges } from '../../../api_src/hymnEditing/hymnChanges';
import { getUserAccess } from '../../../api_src/userAccess';
import { OTHER_SONGS_SLUG } from '../../../contants';
import { hymnSchema } from '../../../schemas/hymn';

/**
 * Admin-only hymn reads and edits. Only the admin list in `getUserAccess` may use these routes.
 * Edits overwrite the hymn file in Firebase Storage and, when the lyrics change, publish a release
 * with the diff. The public site shows an edit after the next build, because hymns are prerendered.
 */
const paramsSchema = z.object({
  hymnBook: z.string().regex(/^[a-z0-9-]+$/),
  hymnNumber: z.coerce.number().int().positive(),
});

const updateSchema = hymnSchema.pick({ title: true, subtitle: true, lyrics: true }).extend({
  message: z.string().optional(),
});

const app = new Hono<{ Bindings: EditorEnv }>().basePath('/api/hymns');

app.use('*', async (c, next) => {
  c.header('Cache-Control', 'private, no-store');

  const email = await resolveVerifiedEmail(c.req.header('Authorization') ?? null);
  if (!email) return c.json({ error: 'Unauthorized' }, 401);
  if (!getUserAccess(email).isAdmin) return c.json({ error: 'Forbidden' }, 403);

  await next();
});

app.get('/:hymnBook/:hymnNumber', zValidator('param', paramsSchema), async (c) => {
  const { hymnBook, hymnNumber } = c.req.valid('param');
  if (hymnBook === OTHER_SONGS_SLUG) return c.json({ error: 'Hymn not found' }, 404);

  const raw = await readHymnFile(c.env, `${hymnBook}/${hymnNumber}.json`);
  if (!raw) return c.json({ error: 'Hymn not found' }, 404);

  const parsed = hymnSchema.safeParse(raw);
  if (!parsed.success) return c.json({ error: 'Invalid hymn data' }, 500);

  return c.json(parsed.data);
});

app.patch(
  '/:hymnBook/:hymnNumber',
  zValidator('param', paramsSchema),
  zValidator('json', updateSchema),
  async (c) => {
    const { hymnBook, hymnNumber } = c.req.valid('param');
    const { title, subtitle, lyrics, message } = c.req.valid('json');
    if (hymnBook === OTHER_SONGS_SLUG) return c.json({ error: 'Hymn not found' }, 404);

    const filePath = `${hymnBook}/${hymnNumber}.json`;
    const raw = await readHymnFile(c.env, filePath);
    if (!raw) return c.json({ error: 'Hymn not found' }, 404);

    const existing = hymnSchema.parse(raw);
    const updated = { ...existing, title, subtitle, lyrics };
    const changes = hymnChanges.generateLyricsDiff(existing, updated);

    await writeHymnFile(c.env, filePath, updated);

    if (changes.length > 0) {
      try {
        const releaseTitle = new Date()
          .toISOString()
          .replace(/T/, '-')
          .replace(/\..+/, '')
          .replace(/:/g, '-');
        const body = hymnChanges.generateReleaseBody({
          hymnBook,
          hymnNumber,
          hymnTitle: title,
          changes,
          message,
        });

        await createHymnRelease(c.env, releaseTitle, body);
      } catch (error) {
        // The hymn is already saved; a failed release must not turn the edit into an error.
        console.error('release-failed', error instanceof Error ? error.message : error);
      }
    }

    return c.body(null, 202);
  }
);

export const onRequest = (context: { request: Request; env: EditorEnv }) =>
  app.fetch(context.request, context.env);

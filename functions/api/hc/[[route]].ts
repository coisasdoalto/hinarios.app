import { Hono } from 'hono';

import { resolveVerifiedEmail } from '../../../api_src/firebaseAuth';
import { getUserAccess } from '../../../api_src/userAccess';
import hcData from '../../generated/hc-data.json';

/**
 * Protected endpoints for the Hinos e Cânticos (HC) book.
 * HC is paused for rights clearance, so its data only leaves this Function for users
 * that `getUserAccess` allows. Responses are never cached, because they depend on the user.
 */

/**
 * Resolves access from the e-mail of the request's verified Firebase ID token.
 * @example await resolveAccess(request); // { isAdmin: false, canAccessHc: true }
 */
async function resolveAccess(request: Request) {
  return getUserAccess(await resolveVerifiedEmail(request.headers.get('Authorization')));
}

const hcHymnBookSlug = 'hinos-e-canticos';

const app = new Hono().basePath('/api/hc');

app.use('*', async (c, next) => {
  c.header('Cache-Control', 'private, no-store');
  await next();
});

app.get('/access', async (c) => c.json(await resolveAccess(c.req.raw)));

app.use('*', async (c, next) => {
  if (c.req.path.endsWith('/access')) return next();

  const access = await resolveAccess(c.req.raw);
  if (!access.canAccessHc) return c.json({ error: 'Hymn not found' }, 404);

  return next();
});

app.get('/book', (c) => c.json({ hymnBook: hcData.hymnBookInfo, index: hcData.index }));

app.get('/titles', (c) =>
  c.json({
    name: hcData.hymnBookInfo.name,
    hymns: Object.fromEntries(hcData.index.map(({ slug, title }) => [slug, title])),
  })
);

app.get('/hymns/:slug', (c) => {
  const number = c.req.param('slug').split('-')[0];
  const hymn = (hcData.hymns as Record<string, unknown>)[number];

  if (!hymn) return c.json({ error: 'Hymn not found' }, 404);

  return c.json(hymn);
});

app.get('/search', (c) =>
  c.json({ hymnBookSlug: hcHymnBookSlug, keys: hcData.searchKeys, shards: hcData.searchShards })
);

export const onRequest = (context: { request: Request }) => app.fetch(context.request);

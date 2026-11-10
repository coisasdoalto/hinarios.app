import { Hono } from 'hono';

import { resolveVerifiedEmail } from '../../../api_src/firebaseAuth';
import { parseRequestCoordinates } from '../../../api_src/locationAccess';
import type { Coordinates, IpLocation } from '../../../api_src/locationAccess';
import { getUserAccess } from '../../../api_src/userAccess';
import hcData from '../../generated/hc-data.json';

/**
 * Protected endpoints for the Hinos e Cânticos (HC) book.
 * HC is paused for rights clearance, so its data only leaves this Function for users
 * that `getUserAccess` allows. Responses are never cached, because they depend on the user.
 */
type CloudflareGeo = {
  city?: string;
  regionCode?: string;
  country?: string;
  latitude?: string;
  longitude?: string;
};

/**
 * Uses the location Cloudflare already resolved for the connection, so no third-party lookup is needed.
 * @example locationFromCloudflare({ city: 'Piracicaba', regionCode: 'SP', country: 'BR', latitude: '-22.72', longitude: '-47.64' });
 */
function locationFromCloudflare(geo?: CloudflareGeo): IpLocation | undefined {
  const latitude = Number(geo?.latitude);
  const longitude = Number(geo?.longitude);

  if (
    !geo?.latitude ||
    !geo?.longitude ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return undefined;
  }

  return {
    city: geo.city ?? '',
    region_code: geo.regionCode ?? '',
    country_code: geo.country ?? '',
    latitude,
    longitude,
  };
}

async function resolveAccess(request: Request) {
  const url = new URL(request.url);
  const browserLocation: Coordinates | undefined = parseRequestCoordinates(
    url.searchParams.get('latitude') ?? undefined,
    url.searchParams.get('longitude') ?? undefined
  );
  const email = await resolveVerifiedEmail(request.headers.get('Authorization'));
  const location =
    browserLocation ?? locationFromCloudflare((request as Request & { cf?: CloudflareGeo }).cf);
  const useExpandedIpRadius =
    !browserLocation && url.searchParams.get('locationFallback') === 'expanded';

  return getUserAccess(email, location, useExpandedIpRadius);
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

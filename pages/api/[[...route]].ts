import type { PageConfig } from 'next';

import { handle } from '@hono/node-server/vercel';
import { Hono } from 'hono';

import { hymnsApp } from 'api-handlers/hymns';

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};

/**
 * @see README.md for more information
 */
const app = new Hono({
  strict: true,
}).basePath('/api/');

app.route('/hymns/', hymnsApp);

export default handle(app);

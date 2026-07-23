import { DecodedIdToken } from 'firebase-admin/auth';
import { Context, Next } from 'hono';

import { auth } from '../../firebase';

declare module 'hono' {
  interface ContextVariableMap {
    user: DecodedIdToken;
  }
}

/**
 * Verifies a Firebase bearer token and stores its decoded user in the request context.
 * @example hymnsApp.get('/private/', authenticatedUserMiddleware, (c) => c.json({ ok: true }));
 */
export async function authenticatedUserMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    c.status(401);
    return c.json({ error: 'Unauthorized - Missing or invalid authorization header' });
  }

  try {
    const decodedToken = await auth.verifyIdToken(authHeader.slice('Bearer '.length));
    c.set('user', decodedToken);
    await next();
  } catch {
    c.status(401);
    return c.json({ error: 'Unauthorized - Invalid token' });
  }
}

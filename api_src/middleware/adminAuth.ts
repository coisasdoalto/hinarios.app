import { Context, Next } from 'hono';

import { getUserAccess } from '../userAccess';

/**
 * Allows an authenticated request to continue only when its user is an administrator.
 * @example hymnsApp.patch('/private/', authenticatedUserMiddleware, adminAuthMiddleware);
 */
export async function adminAuthMiddleware(c: Context, next: Next) {
  const user = c.get('user');

  if (!getUserAccess(user.email).isAdmin) {
    c.status(403);
    return c.json({ error: 'Forbidden - Admin access required' });
  }

  await next();
}

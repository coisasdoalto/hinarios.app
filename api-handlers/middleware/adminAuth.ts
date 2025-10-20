import { DecodedIdToken } from 'firebase-admin/auth';
import { Context, Next } from 'hono';
import { auth } from '../../firebase';

import { ADMINS } from 'hooks/useAdmin';

// Extend Hono context to include user info
declare module 'hono' {
  interface ContextVariableMap {
    user: DecodedIdToken;
  }
}

export async function adminAuthMiddleware(c: Context, next: Next) {
  try {
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      c.status(401);
      return c.json({ error: 'Unauthorized - Missing or invalid authorization header' });
    }

    const idToken = authHeader.replace('Bearer ', '');

    const decodedToken = await auth.verifyIdToken(idToken);

    if (!decodedToken.email || !ADMINS.includes(decodedToken.email)) {
      c.status(403);
      return c.json({ error: 'Forbidden - Admin access required' });
    }

    // Add user info to context for potential use in handlers
    c.set('user', decodedToken);

    await next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    c.status(401);
    return c.json({ error: 'Unauthorized - Invalid token' });
  }
}

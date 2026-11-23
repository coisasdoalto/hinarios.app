import { Context } from 'hono';

import { auth } from '../firebase';
import type { UserAccess } from '../types/UserAccess';
import { getUserAccess } from './userAccess';

async function resolveAuthorizationEmail(
  authorizationHeader?: string
): Promise<string | undefined> {
  if (!authorizationHeader?.startsWith('Bearer ')) return undefined;

  try {
    const user = await auth.verifyIdToken(authorizationHeader.slice('Bearer '.length));
    return user.email ?? undefined;
  } catch {
    return undefined;
  }
}

/**
 * Resolves access from the e-mail of the request's Firebase ID token.
 * @example getRequestUserAccess(context); // { isAdmin: false, canAccessHc: true }
 */
export async function getRequestUserAccess(context: Context): Promise<UserAccess> {
  return getUserAccess(await resolveAuthorizationEmail(context.req.header('Authorization')));
}

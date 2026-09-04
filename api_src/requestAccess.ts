import { Context } from 'hono';

import { auth } from '../firebase';
import type { UserAccess } from '../types/UserAccess';
import { getRequestIp, IpLocationResolver } from './locationAccess';
import { getUserAccess } from './userAccess';

const ipLocationResolver = new IpLocationResolver();

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
 * Resolves access using the request IP before falling back to the email list.
 * @example getRequestUserAccess(context); // { isAdmin: false, canAccessHc: true }
 */
export async function getRequestUserAccess(context: Context): Promise<UserAccess> {
  const location = await ipLocationResolver.resolve(getRequestIp(context.req.raw.headers));
  const email = await resolveAuthorizationEmail(context.req.header('Authorization'));

  return getUserAccess(email, location);
}

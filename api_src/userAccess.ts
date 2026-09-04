import type { UserAccess } from 'types/UserAccess';
import { isPiracicabaLocation } from './locationAccess';
import type { IpLocation } from './locationAccess';

const ADMIN_EMAILS = new Set(['pablo.dinella@gmail.com', 'raphaeldeoliveiracorrea@gmail.com']);

const HC_ALLOWED_EMAILS = new Set([
  'irmaosdiadema@gmail.com',
  'raphaeldeoliveiracorrea@gmail.com',
  'pablo.dinella@gmail.com',
  'mateusbenicio0123@gmail.com',
  'dok.rec@gmail.com',
]);

/**
 * Resolves access by checking Piracicaba first and the email list second.
 * @example getUserAccess(undefined, { city: 'Piracicaba', region_code: 'SP', country_code: 'BR' });
 */
export function getUserAccess(email?: string | null, location?: IpLocation): UserAccess {
  const normalizedEmail = email?.trim().toLowerCase();

  if (isPiracicabaLocation(location)) {
    return {
      isAdmin: ADMIN_EMAILS.has(normalizedEmail ?? ''),
      canAccessHc: true,
    };
  }

  if (!normalizedEmail) {
    return { isAdmin: false, canAccessHc: false };
  }

  return {
    isAdmin: ADMIN_EMAILS.has(normalizedEmail),
    canAccessHc: HC_ALLOWED_EMAILS.has(normalizedEmail),
  };
}

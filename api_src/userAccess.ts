import type { UserAccess } from 'types/UserAccess';
import {
  EXPANDED_IP_RADIUS_KM,
  isPiracicabaLocation,
  isWithinPiracicabaRadius,
  PRECISE_LOCATION_RADIUS_KM,
} from './locationAccess';
import type { Coordinates, IpLocation } from './locationAccess';

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
export function getUserAccess(
  email?: string | null,
  location?: IpLocation | Coordinates,
  useExpandedIpRadius = false
): UserAccess {
  const normalizedEmail = email?.trim().toLowerCase();
  const canAccessByLocation =
    (location && 'city' in location && isPiracicabaLocation(location)) ||
    (location &&
      isWithinPiracicabaRadius(
        location,
        useExpandedIpRadius ? EXPANDED_IP_RADIUS_KM : PRECISE_LOCATION_RADIUS_KM
      ));

  if (canAccessByLocation) {
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

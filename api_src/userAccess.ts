import type { UserAccess } from 'types/UserAccess';

const ADMIN_EMAILS = new Set(['pablo.dinella@gmail.com', 'raphaeldeoliveiracorrea@gmail.com']);

const HC_ALLOWED_EMAILS = new Set([
  'irmaosdiadema@gmail.com',
  'raphaeldeoliveiracorrea@gmail.com',
  'pablo.dinella@gmail.com',
  'mateusbenicio0123@gmail.com',
  'dok.rec@gmail.com',
]);

/**
 * Resolves private application permissions from an authenticated email.
 * @example getUserAccess('person@example.com'); // { isAdmin: false, canAccessHc: false }
 */
export function getUserAccess(email?: string | null): UserAccess {
  const normalizedEmail = email?.trim().toLowerCase();

  if (!normalizedEmail) {
    return { isAdmin: false, canAccessHc: false };
  }

  return {
    isAdmin: ADMIN_EMAILS.has(normalizedEmail),
    canAccessHc: HC_ALLOWED_EMAILS.has(normalizedEmail),
  };
}

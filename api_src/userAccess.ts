import type { UserAccess } from 'types/UserAccess';

const ADMIN_EMAILS = new Set(['pablo.dinella@gmail.com', 'raphaeldeoliveiracorrea@gmail.com']);

const HC_ALLOWED_EMAILS = new Set([
  'irmaosdiadema@gmail.com',
  'raphaeldeoliveiracorrea@gmail.com',
  'pablo.dinella@gmail.com',
  'mateusbenicio0123@gmail.com',
  'dok.rec@gmail.com',
  'kaformentini@gmail.com',
]);

/**
 * Resolves access from the signed-in user's verified e-mail only.
 * @example getUserAccess('pablo.dinella@gmail.com'); // { isAdmin: true, canAccessHc: true }
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

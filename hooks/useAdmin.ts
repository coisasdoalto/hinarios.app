import { useAccess } from './useAccess';

/**
 * Reports whether the current authenticated user has server-authorized admin access.
 * @example const { isAdmin } = useAdmin();
 */
export function useAdmin() {
  const { isAdmin, isLoading } = useAccess();

  return {
    isLoading,
    isAdmin,
  };
}

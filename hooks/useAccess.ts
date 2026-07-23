import { useQuery } from '@tanstack/react-query';

import type { UserAccess } from 'types/UserAccess';
import { authenticatedAxios } from 'utils/authenticatedFetch';
import { useUser } from './useUser';

const NO_ACCESS: UserAccess = {
  isAdmin: false,
  canAccessHc: false,
};

/**
 * Loads the current user's server-side application permissions.
 * @example const { canAccessHc } = useAccess();
 */
export function useAccess() {
  const { isLoading: isLoadingUser, user } = useUser();
  const accessQuery = useQuery({
    queryKey: ['user_access', user?.uid],
    queryFn: async () => {
      const response = await authenticatedAxios<UserAccess>('/api/hymns/access/');
      return response.data;
    },
    enabled: Boolean(user),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  return {
    ...(accessQuery.data ?? NO_ACCESS),
    isLoading: isLoadingUser || (Boolean(user) && accessQuery.isLoading),
  };
}

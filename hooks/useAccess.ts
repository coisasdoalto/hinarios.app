import { useQuery } from '@tanstack/react-query';

import type { UserAccess } from 'types/UserAccess';
import { hcGet } from '../utils/hcRequest';
import { useUser } from './useUser';

const NO_ACCESS: UserAccess = {
  isAdmin: false,
  canAccessHc: false,
};

/**
 * Asks the server for the signed-in user's access. HC is granted by e-mail only.
 * @example const { canAccessHc } = await requestUserAccess();
 */
export async function requestUserAccess(): Promise<UserAccess> {
  return (await hcGet<UserAccess>('/api/hc/access')).data;
}

/**
 * Loads the current user's server-side application permissions.
 * @example const { canAccessHc } = useAccess();
 */
export function useAccess() {
  const { isLoading: isLoadingUser, user } = useUser();
  const accessQuery = useQuery({
    queryKey: ['user_access', user?.uid ?? 'anonymous'],
    queryFn: requestUserAccess,
    enabled: !isLoadingUser,
    retry: false,
    // Access only depends on the signed-in user, and login/logout changes the key.
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return {
    ...(accessQuery.data ?? NO_ACCESS),
    isLoading: isLoadingUser || accessQuery.isLoading,
  };
}

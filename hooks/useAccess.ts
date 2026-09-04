import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import type { UserAccess } from 'types/UserAccess';
import { auth } from '../firebase/web';
import { useUser } from './useUser';

const NO_ACCESS: UserAccess = {
  isAdmin: false,
  canAccessHc: false,
};

async function requestUserAccess(): Promise<UserAccess> {
  const user = auth.currentUser;
  const idToken = user ? await user.getIdToken() : undefined;
  const response = await axios.get<UserAccess>('/api/hymns/access/', {
    headers: idToken ? { Authorization: `Bearer ${idToken}` } : undefined,
  });

  return response.data;
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
    staleTime: 5 * 60 * 1000,
  });

  return {
    ...(accessQuery.data ?? NO_ACCESS),
    isLoading: isLoadingUser || accessQuery.isLoading,
  };
}

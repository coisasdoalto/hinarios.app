import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import type { UserAccess } from 'types/UserAccess';
import { auth } from '../firebase/web';
import { useUser } from './useUser';

const NO_ACCESS: UserAccess = {
  isAdmin: false,
  canAccessHc: false,
};

type BrowserCoordinates = {
  latitude: number;
  longitude: number;
};

type AccessRequestOptions = {
  browserCoordinates?: BrowserCoordinates;
  useExpandedIpRadius?: boolean;
};

function requestBrowserLocation(): Promise<BrowserCoordinates | undefined> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) {
    return Promise.resolve(undefined);
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({ latitude: coords.latitude, longitude: coords.longitude }),
      () => resolve(undefined),
      { enableHighAccuracy: true, maximumAge: 5 * 60 * 1000, timeout: 10 * 1000 }
    );
  });
}

async function fetchUserAccess(options: AccessRequestOptions = {}): Promise<UserAccess> {
  const user = auth.currentUser;
  const idToken = user ? await user.getIdToken() : undefined;
  const response = await axios.get<UserAccess>('/api/hymns/access/', {
    params: {
      ...(options.browserCoordinates ?? {}),
      ...(options.useExpandedIpRadius ? { locationFallback: 'expanded' } : {}),
    },
    headers: idToken ? { Authorization: `Bearer ${idToken}` } : undefined,
  });

  return response.data;
}

async function requestUserAccess(): Promise<UserAccess> {
  const initialAccess = await fetchUserAccess();
  if (initialAccess.canAccessHc) return initialAccess;

  const browserCoordinates = await requestBrowserLocation();
  if (browserCoordinates) return fetchUserAccess({ browserCoordinates });

  return fetchUserAccess({ useExpandedIpRadius: true });
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

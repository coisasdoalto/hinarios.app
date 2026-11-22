import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import type { UserAccess } from 'types/UserAccess';
import { auth } from '../firebase/web';
import {
  BrowserCoordinates,
  getRememberedCoordinates,
  rememberHcAccessParams,
} from '../utils/hcRequest';
import { useUser } from './useUser';

const NO_ACCESS: UserAccess = {
  isAdmin: false,
  canAccessHc: false,
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
  const response = await axios.get<UserAccess>('/api/hc/access', {
    params: {
      ...(options.browserCoordinates ?? {}),
      ...(options.useExpandedIpRadius ? { locationFallback: 'expanded' } : {}),
    },
    headers: idToken ? { Authorization: `Bearer ${idToken}` } : undefined,
  });

  return response.data;
}

/**
 * Asks the server for access, trying the connection's location and e-mail first, then the
 * browser location, then the expanded IP radius. Whatever granted access is remembered, so the
 * HC requests that follow (book, titles, search) are checked the same way.
 * @example const { canAccessHc } = await requestUserAccess();
 */
export async function requestUserAccess(): Promise<UserAccess> {
  const initialAccess = await fetchUserAccess();
  if (initialAccess.canAccessHc) {
    rememberHcAccessParams(undefined);
    return initialAccess;
  }

  // A later check can fail to read the location (timeout, GPS off), so keep the last one that was read.
  const browserCoordinates = (await requestBrowserLocation()) ?? getRememberedCoordinates();
  if (browserCoordinates) {
    rememberHcAccessParams(browserCoordinates);
    return fetchUserAccess({ browserCoordinates });
  }

  rememberHcAccessParams({ locationFallback: 'expanded' });
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
    // Check once per page load (and on login/logout, which changes the key). Rechecking on focus
    // could ask for the location again and drop HC from the open app when that read fails.
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return {
    ...(accessQuery.data ?? NO_ACCESS),
    isLoading: isLoadingUser || accessQuery.isLoading,
  };
}

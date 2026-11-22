import axios, { AxiosRequestConfig } from 'axios';

import { auth } from '../firebase/web';

export type BrowserCoordinates = { latitude: number; longitude: number };

/**
 * Query parameters that made the server grant HC access: the browser location, or the
 * expanded IP radius used when the browser doesn't share its location.
 */
export type HcAccessParams = BrowserCoordinates | { locationFallback: 'expanded' };

let lastAccessParams: HcAccessParams | undefined;

/**
 * Remembers how the server granted access, so later HC requests are checked the same way.
 * The server checks each request on its own, so a request that left these out would be refused.
 * @example rememberHcAccessParams({ latitude: -22.7253, longitude: -47.6492 });
 */
export function rememberHcAccessParams(params?: HcAccessParams) {
  lastAccessParams = params;
}

/**
 * The last browser location that was sent to the server, if any.
 * @example const coordinates = getRememberedCoordinates();
 */
export function getRememberedCoordinates(): BrowserCoordinates | undefined {
  return lastAccessParams && 'latitude' in lastAccessParams ? lastAccessParams : undefined;
}

/**
 * GET to the protected HC API with the signed-in user's ID token and the params that granted access.
 * @example const { data } = await hcGet<HcTitles>('/api/hc/titles');
 */
export async function hcGet<ResponseBody>(url: string, config: AxiosRequestConfig = {}) {
  const user = auth.currentUser;
  const idToken = user ? await user.getIdToken() : undefined;

  return axios.get<ResponseBody>(url, {
    ...config,
    params: { ...(lastAccessParams ?? {}), ...config.params },
    headers: {
      ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
      ...config.headers,
    },
  });
}

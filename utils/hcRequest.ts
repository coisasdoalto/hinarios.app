import axios, { AxiosRequestConfig } from 'axios';

import { auth } from '../firebase/web';

type BrowserCoordinates = { latitude: number; longitude: number };

let lastBrowserCoordinates: BrowserCoordinates | undefined;

/**
 * Remembers the browser location that granted access, so later HC requests can send it too.
 * The server grants HC by location as well as by e-mail, and it checks each request on its own.
 * @example rememberBrowserCoordinates({ latitude: -22.7253, longitude: -47.6492 });
 */
export function rememberBrowserCoordinates(coordinates?: BrowserCoordinates) {
  lastBrowserCoordinates = coordinates;
}

/**
 * GET to the protected HC API with the signed-in user's ID token and the last known location.
 * @example const { data } = await hcGet<HcTitles>('/api/hc/titles');
 */
export async function hcGet<ResponseBody>(url: string, config: AxiosRequestConfig = {}) {
  const user = auth.currentUser;
  const idToken = user ? await user.getIdToken() : undefined;

  return axios.get<ResponseBody>(url, {
    ...config,
    params: { ...(lastBrowserCoordinates ?? {}), ...config.params },
    headers: {
      ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
      ...config.headers,
    },
  });
}

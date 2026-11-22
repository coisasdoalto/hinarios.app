import axios, { AxiosRequestConfig } from 'axios';

import { auth } from '../firebase/web';

/**
 * GET to the protected HC API with the signed-in user's ID token.
 * The server grants HC by e-mail, so requests without a signed-in user are refused.
 * @example const { data } = await hcGet<HcTitles>('/api/hc/titles');
 */
export async function hcGet<ResponseBody>(url: string, config: AxiosRequestConfig = {}) {
  const user = auth.currentUser;
  const idToken = user ? await user.getIdToken() : undefined;

  return axios.get<ResponseBody>(url, {
    ...config,
    headers: {
      ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
      ...config.headers,
    },
  });
}

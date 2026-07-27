import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

import { auth } from '../firebase/web';

/**
 * Makes an Axios request using the current Firebase user's ID token.
 * @example authenticatedAxios<UserAccess>('/api/hymns/access/');
 */
export async function authenticatedAxios<ResponseBody = unknown>(
  url: string,
  config: AxiosRequestConfig = {}
): Promise<AxiosResponse<ResponseBody>> {
  const user = auth.currentUser;

  if (!user) {
    throw new Error('User not authenticated');
  }

  const idToken = await user.getIdToken();

  return axios<ResponseBody>({
    url,
    ...config,
    headers: {
      ...config.headers,
      Authorization: `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
  });
}

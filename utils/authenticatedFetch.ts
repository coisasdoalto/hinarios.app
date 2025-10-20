import axios, { AxiosRequestConfig } from 'axios';

import { auth } from '../firebase/web';

export async function authenticatedAxios(url: string, config: AxiosRequestConfig = {}) {
  const user = auth.currentUser;

  if (!user) {
    throw new Error('User not authenticated');
  }

  const idToken = await user.getIdToken();

  return axios({
    url,
    ...config,
    headers: {
      ...config.headers,
      Authorization: `Bearer ${idToken}`,
      'Content-Type': 'application/json',
    },
  });
}

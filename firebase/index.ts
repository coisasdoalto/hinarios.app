import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getStorage } from 'firebase-admin/storage';

const app = !getApps().length
  ? initializeApp({
      credential: cert({
        privateKey: process.env.PRIVATE_KEY?.replace(/\\n/g, '\n'),
        projectId: process.env.PROJECT_ID,
        clientEmail: process.env.CLIENT_EMAIL,
      }),
      databaseURL: 'https://hinos-online.firebaseio.com',
      storageBucket: 'hinos-online.appspot.com',
    })
  : getApps()[0];

export const storage = getStorage(app);
export const auth = getAuth(app);

export default app;

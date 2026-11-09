import { importPKCS8, SignJWT } from 'jose';
import { toPkcs8Pem } from '../pemKeys';

export type EditorEnv = {
  PRIVATE_KEY?: string;
  CLIENT_EMAIL?: string;
  GITHUB_APP_ID?: string;
  GITHUB_APP_PRIVATE_KEY?: string;
  GITHUB_APP_INSTALLATION_ID?: string;
};

const STORAGE_BUCKET = 'hinos-online.appspot.com';
const STORAGE_SCOPE = 'https://www.googleapis.com/auth/devstorage.read_write';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GITHUB_API = 'https://api.github.com';
const RELEASE_REPOSITORY = 'coisasdoalto/hinarios.app';

let cachedStorageToken: { token: string; expiresAt: number } | undefined;

/**
 * Exchanges the service account for a short-lived OAuth token with Storage scope.
 * @example const token = await storageAccessToken(env);
 */
async function storageAccessToken(env: EditorEnv): Promise<string> {
  if (cachedStorageToken && cachedStorageToken.expiresAt > Date.now() + 60_000) {
    return cachedStorageToken.token;
  }

  if (!env.PRIVATE_KEY || !env.CLIENT_EMAIL) throw new Error('service-account-missing');

  const key = await importPKCS8(toPkcs8Pem(env.PRIVATE_KEY), 'RS256');
  const assertion = await new SignJWT({ scope: STORAGE_SCOPE })
    .setProtectedHeader({ alg: 'RS256' })
    .setIssuer(env.CLIENT_EMAIL)
    .setSubject(env.CLIENT_EMAIL)
    .setAudience(GOOGLE_TOKEN_URL)
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(key);

  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });
  if (!response.ok) throw new Error('google-token-failed');

  const data = (await response.json()) as { access_token: string; expires_in: number };
  cachedStorageToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return data.access_token;
}

/**
 * Reads a hymn file from Firebase Storage. Returns null when the file does not exist.
 * @example await readHymnFile(env, 'hinario-alvorada/1.json');
 */
export async function readHymnFile(env: EditorEnv, filePath: string): Promise<unknown | null> {
  const token = await storageAccessToken(env);
  const response = await fetch(
    `https://storage.googleapis.com/storage/v1/b/${STORAGE_BUCKET}/o/${encodeURIComponent(
      filePath
    )}?alt=media`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (response.status === 404) return null;
  if (!response.ok) throw new Error('storage-read-failed');

  return response.json();
}

/**
 * Overwrites a hymn file in Firebase Storage.
 * @example await writeHymnFile(env, 'hinario-alvorada/1.json', hymn);
 */
export async function writeHymnFile(
  env: EditorEnv,
  filePath: string,
  data: unknown
): Promise<void> {
  const token = await storageAccessToken(env);
  const response = await fetch(
    `https://storage.googleapis.com/upload/storage/v1/b/${STORAGE_BUCKET}/o?uploadType=media&name=${encodeURIComponent(
      filePath
    )}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data, null, 2),
    }
  );

  if (!response.ok) throw new Error('storage-write-failed');
}

/**
 * Creates a release in the content repository, authenticated as the GitHub App installation.
 * @example await createHymnRelease(env, '2026-11-10-12-00-00', '# Ajustes de conteúdo');
 */
export async function createHymnRelease(env: EditorEnv, title: string, body: string) {
  if (!env.GITHUB_APP_ID || !env.GITHUB_APP_PRIVATE_KEY || !env.GITHUB_APP_INSTALLATION_ID) {
    throw new Error('github-app-missing');
  }

  const now = Math.floor(Date.now() / 1000);
  const appKey = await importPKCS8(toPkcs8Pem(env.GITHUB_APP_PRIVATE_KEY), 'RS256');
  const appJwt = await new SignJWT({})
    .setProtectedHeader({ alg: 'RS256' })
    .setIssuer(env.GITHUB_APP_ID)
    .setIssuedAt(now - 60)
    .setExpirationTime(now + 540)
    .sign(appKey);

  const githubHeaders = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'hinarios-app-editor',
  };

  const tokenResponse = await fetch(
    `${GITHUB_API}/app/installations/${env.GITHUB_APP_INSTALLATION_ID}/access_tokens`,
    { method: 'POST', headers: { ...githubHeaders, Authorization: `Bearer ${appJwt}` } }
  );
  if (!tokenResponse.ok) throw new Error('github-installation-token-failed');

  const { token } = (await tokenResponse.json()) as { token: string };

  const releaseResponse = await fetch(`${GITHUB_API}/repos/${RELEASE_REPOSITORY}/releases`, {
    method: 'POST',
    headers: {
      ...githubHeaders,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tag_name: title, name: title, body, draft: false, prerelease: false }),
  });
  if (!releaseResponse.ok) throw new Error('github-release-failed');
}

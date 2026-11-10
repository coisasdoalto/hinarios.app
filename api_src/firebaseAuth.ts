import { importX509, jwtVerify } from 'jose';

export const FIREBASE_PROJECT_ID = 'hinos-online';
// Firebase publishes its ID-token signing keys as X.509 certificates, keyed by `kid`.
const FIREBASE_CERTIFICATES_URL =
  'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';
const CERTIFICATES_TTL_MS = 60 * 60 * 1000;

let cachedCertificates: { pems: Record<string, string>; expiresAt: number } | undefined;

async function firebaseSigningKey(kid?: string) {
  if (
    !cachedCertificates ||
    cachedCertificates.expiresAt < Date.now() ||
    !(kid && cachedCertificates.pems[kid])
  ) {
    const response = await fetch(FIREBASE_CERTIFICATES_URL);
    if (!response.ok) throw new Error('certificates-unavailable');

    cachedCertificates = {
      pems: (await response.json()) as Record<string, string>,
      expiresAt: Date.now() + CERTIFICATES_TTL_MS,
    };
  }

  const pem = kid ? cachedCertificates.pems[kid] : undefined;
  if (!pem) throw new Error('unknown-kid');

  return importX509(pem, 'RS256');
}

/**
 * Returns the verified e-mail of a Firebase ID token from an `Authorization: Bearer` header.
 * @example await resolveVerifiedEmail(request.headers.get('Authorization'));
 */
export async function resolveVerifiedEmail(
  authorization: string | null
): Promise<string | undefined> {
  if (!authorization?.startsWith('Bearer ')) return undefined;

  try {
    const { payload } = await jwtVerify(
      authorization.slice('Bearer '.length),
      ({ kid }) => firebaseSigningKey(kid),
      {
        algorithms: ['RS256'],
        issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
        audience: FIREBASE_PROJECT_ID,
      }
    );

    return typeof payload.email === 'string' ? payload.email : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Accepts a PEM private key in PKCS#8 or PKCS#1 form and returns PKCS#8, which WebCrypto imports.
 * GitHub App keys are PKCS#1 ("BEGIN RSA PRIVATE KEY"); Firebase service-account keys are PKCS#8.
 * @example toPkcs8Pem(process.env.GITHUB_APP_PRIVATE_KEY ?? '');
 */
export function toPkcs8Pem(rawPem: string): string {
  const pem = rawPem.replace(/\\n/g, '\n').trim();
  if (!pem.includes('BEGIN RSA PRIVATE KEY')) return pem;

  const pkcs1 = base64ToBytes(pem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, ''));
  const rsaAlgorithm = [
    0x30, 0x0d, 0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01, 0x05, 0x00,
  ];
  const pkcs8 = derWrap(0x30, [0x02, 0x01, 0x00, ...rsaAlgorithm, ...derWrap(0x04, pkcs1)]);

  return `-----BEGIN PRIVATE KEY-----\n${bytesToBase64(pkcs8)}\n-----END PRIVATE KEY-----`;
}

function derLength(length: number): number[] {
  if (length < 0x80) return [length];

  const bytes: number[] = [];
  for (let value = length; value > 0; value >>= 8) bytes.unshift(value & 0xff);

  return [0x80 | bytes.length, ...bytes];
}

function derWrap(tag: number, content: number[] | Uint8Array): number[] {
  return [tag, ...derLength(content.length), ...Array.from(content)];
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function bytesToBase64(bytes: number[] | Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

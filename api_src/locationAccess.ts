import { z } from 'zod';

const PIRACICABA_CITY = 'piracicaba';
const SAO_PAULO_REGION = 'SP';
const BRAZIL_COUNTRY = 'BR';

const ipLocationSchema = z.object({
  city: z.string(),
  region_code: z.string(),
  country_code: z.string(),
});

export type IpLocation = z.infer<typeof ipLocationSchema>;
export type IpLocationResponse = {
  json(): Promise<unknown>;
  ok: boolean;
};
export type IpLocationFetcher = (url: string) => Promise<IpLocationResponse>;

function normalizeLocationValue(value: string | null | undefined): string {
  return (value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/gu, '')
    .trim()
    .toLocaleLowerCase('pt-BR');
}

/**
 * Determines whether an IP geolocation belongs to Piracicaba, São Paulo, Brazil.
 * @example isPiracicabaLocation({ city: 'Piracicaba', region_code: 'SP', country_code: 'BR' }); // true
 */
export function isPiracicabaLocation(location?: IpLocation): boolean {
  return (
    normalizeLocationValue(location?.city) === PIRACICABA_CITY &&
    normalizeLocationValue(location?.region_code) === SAO_PAULO_REGION.toLocaleLowerCase() &&
    normalizeLocationValue(location?.country_code) === BRAZIL_COUNTRY.toLocaleLowerCase()
  );
}

/**
 * Extracts the original client IP from the headers supplied by the hosting proxy.
 * @example getRequestIp(new Headers({ 'x-forwarded-for': '203.0.113.10' })); // '203.0.113.10'
 */
export function getRequestIp(headers: Headers): string | undefined {
  const forwardedIp = headers.get('cf-connecting-ip') ?? headers.get('x-real-ip');
  if (forwardedIp?.trim()) return forwardedIp.trim();

  const forwardedFor = headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwardedFor || undefined;
}

/**
 * Resolves an IP address through the server-side geolocation provider.
 * @example new IpLocationResolver().resolve('203.0.113.10');
 */
export class IpLocationResolver {
  constructor(private readonly fetcher: IpLocationFetcher = async (url) => fetch(url)) {}

  async resolve(ip?: string): Promise<IpLocation | undefined> {
    if (!ip) return undefined;

    try {
      const response = await this.fetcher(`https://ipapi.co/${encodeURIComponent(ip)}/json/`);
      if (!response.ok) return undefined;

      const parsedLocation = ipLocationSchema.safeParse(await response.json());
      return parsedLocation.success ? parsedLocation.data : undefined;
    } catch {
      return undefined;
    }
  }
}

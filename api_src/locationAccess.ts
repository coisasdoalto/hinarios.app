import { z } from 'zod';

const PIRACICABA_CITY = 'piracicaba';
const SAO_PAULO_REGION = 'SP';
const BRAZIL_COUNTRY = 'BR';
const PIRACICABA_LATITUDE = -22.7253;
const PIRACICABA_LONGITUDE = -47.6492;
export const PRECISE_LOCATION_RADIUS_KM = 15;
export const EXPANDED_IP_RADIUS_KM = 75;

const coordinatesSchema = z.object({
  latitude: z.number().finite().min(-90).max(90),
  longitude: z.number().finite().min(-180).max(180),
});

const ipLocationSchema = z.object({
  city: z.string(),
  region_code: z.string(),
  country_code: z.string(),
  ...coordinatesSchema.shape,
});

export type Coordinates = z.infer<typeof coordinatesSchema>;
export type IpLocation = z.infer<typeof ipLocationSchema>;
export type IpLocationResponse = {
  json(): Promise<unknown>;
  ok: boolean;
};
export type IpLocationFetcher = (url: string) => Promise<IpLocationResponse>;
type IpLocationIdentity = Pick<IpLocation, 'city' | 'region_code' | 'country_code'>;

const PIRACICABA_COORDINATES: Coordinates = {
  latitude: PIRACICABA_LATITUDE,
  longitude: PIRACICABA_LONGITUDE,
};

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
export function isPiracicabaLocation(location?: IpLocationIdentity): boolean {
  return (
    normalizeLocationValue(location?.city) === PIRACICABA_CITY &&
    normalizeLocationValue(location?.region_code) === SAO_PAULO_REGION.toLocaleLowerCase() &&
    normalizeLocationValue(location?.country_code) === BRAZIL_COUNTRY.toLocaleLowerCase()
  );
}

function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Determines whether coordinates are within a radius around Piracicaba.
 * @example isWithinPiracicabaRadius({ latitude: -22.7253, longitude: -47.6492 }, 15); // true
 */
export function isWithinPiracicabaRadius(coordinates: Coordinates, radiusKm: number): boolean {
  const earthRadiusKm = 6371;
  const latitudeDelta = degreesToRadians(coordinates.latitude - PIRACICABA_COORDINATES.latitude);
  const longitudeDelta = degreesToRadians(coordinates.longitude - PIRACICABA_COORDINATES.longitude);
  const latitude = degreesToRadians(coordinates.latitude);
  const targetLatitude = degreesToRadians(PIRACICABA_COORDINATES.latitude);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(latitude) * Math.cos(targetLatitude) * Math.sin(longitudeDelta / 2) ** 2;
  const distanceKm = earthRadiusKm * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));

  return distanceKm <= radiusKm;
}

/**
 * Parses browser coordinates received as request query parameters.
 * @example parseRequestCoordinates('-22.7253', '-47.6492');
 */
export function parseRequestCoordinates(
  latitude?: string,
  longitude?: string
): Coordinates | undefined {
  if (!latitude || !longitude) return undefined;

  const parsedCoordinates = coordinatesSchema.safeParse({
    latitude: Number(latitude),
    longitude: Number(longitude),
  });

  return parsedCoordinates.success ? parsedCoordinates.data : undefined;
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

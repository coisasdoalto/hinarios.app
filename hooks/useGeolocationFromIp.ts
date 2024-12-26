import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

type IpInfo = {
  ip: string;
  network: string;
  version: string;
  city: string;
  region: string;
  region_code: string;
  country: string;
  country_name: string;
  country_code: string;
  country_code_iso3: string;
  country_capital: string;
  country_tld: string;
  continent_code: string;
  in_eu: boolean;
  postal: string;
  latitude: number;
  longitude: number;
  timezone: string;
  utc_offset: string;
  country_calling_code: string;
  currency: string;
  currency_name: string;
  languages: string;
  country_area: number;
  country_population: number;
  asn: string;
  org: string;
};

export function useGeolocationFromIp() {
  return useQuery({
    queryKey: ['ipinfo'],
    queryFn: async () => {
      const response = await axios.get<IpInfo>('https://ipapi.co/json/');

      return response.data;
    },
    staleTime: Infinity,
  });
}
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/router';
import { supabase } from 'supabase';
import { useGeolocationFromIp } from './useGeolocationFromIp';

export function useProximityHymns() {
  const router = useRouter();

  const { data: geolocation, isLoading } = useGeolocationFromIp();

  const hymnBook = String(router.query.hymnBook);
  const slug = String(router.query.slug);

  return useQuery({
    queryKey: ['nearby_hymns'],
    queryFn: async () => {
      const { latitude, longitude } = geolocation!;
      const { data, error } = await supabase.rpc('nearby_hymns', {
        lat: latitude,
        lon: longitude,
      });

      if (error) {
        console.error('Error fetching nearest hymns:', error);
        return [];
      }

      return data.filter((hymn) => hymn.slug !== `${hymnBook}/${slug}`);
    },
    enabled: !isLoading && Boolean(geolocation),
  });
}

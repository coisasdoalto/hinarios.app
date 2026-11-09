import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { HC_HYMN_BOOK_SLUG } from '../contants';
import { hcGet } from '../utils/hcRequest';
import { useAccess } from './useAccess';

export type HymnTitles = Record<string, { name: string; hymns: Record<string, string> }>;

type HcTitles = { name: string; hymns: Record<string, string> };

/**
 * Loads the titles used to label favorites: the public static index, plus HC for users with access.
 * @example const { data: titles, isLoading } = useHymnTitles();
 */
export function useHymnTitles() {
  const { canAccessHc, isLoading: isLoadingAccess } = useAccess();

  const publicTitles = useQuery({
    queryKey: ['hymn_titles'],
    queryFn: async () => (await axios.get<HymnTitles>('/data/titles.json')).data,
    staleTime: Infinity,
  });

  const hcTitles = useQuery({
    queryKey: ['hc_titles'],
    queryFn: async () => (await hcGet<HcTitles>('/api/hc/titles')).data,
    enabled: canAccessHc,
    staleTime: Infinity,
  });

  return {
    data:
      publicTitles.data && hcTitles.data
        ? { ...publicTitles.data, [HC_HYMN_BOOK_SLUG]: hcTitles.data }
        : publicTitles.data,
    isLoading: publicTitles.isLoading || isLoadingAccess || (canAccessHc && hcTitles.isLoading),
  };
}

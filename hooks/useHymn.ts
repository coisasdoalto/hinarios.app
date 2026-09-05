import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { HymnBookInfo } from 'schemas/hymnBookInfo';

type UseHymnData = {
  title: string;
  hymnBook: HymnBookInfo;
};

export function useHymn({
  hymnIdentifier,
  hymnBook,
}: {
  hymnIdentifier: number | string;
  hymnBook: string;
}) {
  return useQuery({
    queryKey: ['hymns', hymnIdentifier, hymnBook],
    queryFn: async () => {
      const response = await axios.get<UseHymnData>(
        `/api/hymns/${hymnBook}/${encodeURIComponent(hymnIdentifier)}`
      );

      return response.data;
    },
  });
}

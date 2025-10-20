import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useUser } from '../useUser';

import { useEffect } from 'react';
import { db } from '../../firebase/web/database';

export function useGetBookmarks() {
  const {user} = useUser();

  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    const unsub = db.users.get(db.users.id(user.uid)).on((user) => {
      queryClient.setQueryData(['bookmarks'], user?.data.bookmarks);
    });

    return () => unsub();
  }, [user?.uid]);

  return useQuery({
    queryKey: ['bookmarks'],
    queryFn: async () => {
      const userData = await db.users.get(db.users.id(user?.uid!));

      if (!userData?.data) return [];

      return userData?.data.bookmarks;
    },
  });
}

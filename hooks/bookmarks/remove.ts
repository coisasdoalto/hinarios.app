import { useMutation } from '@tanstack/react-query';

import { db } from '../../firebase/web/database';
import { Bookmark } from '../../types/database/Bookmark';
import { useUser } from '../useUser';

export function useRemoveBookmark() {
  const {user} = useUser();

  return useMutation({
    mutationFn: async (hymn: Bookmark) => {
      const userData = await db.users.get(db.users.id(user?.uid!));

      if (!userData?.data) {
        return;
      }

      await db.users.update(db.users.id(user?.uid!), ($) =>
        $.field('bookmarks').set($.arrayRemove(hymn))
      );
    },
  });
}

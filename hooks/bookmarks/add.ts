import { useMutation } from '@tanstack/react-query';

import { db } from '../../firebase/web/database';
import { Bookmark } from '../../types/database/Bookmark';
import { useUser } from '../useUser';

export function useAddBookmark() {
  const {user} = useUser();

  return useMutation({
    mutationFn: async (hymn: Bookmark) => {
      const userData = await db.users.get(db.users.id(user?.uid!));

      if (!userData?.data) {
        await db.users.set(db.users.id(user?.uid!), {
          bookmarks: [hymn],
        });

        return;
      }

      await db.users.update(db.users.id(user?.uid!), ($) =>
        $.field('bookmarks').set($.arrayUnion(hymn))
      );
    },
  });
}

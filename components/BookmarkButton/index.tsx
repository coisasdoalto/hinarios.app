import { ActionIcon, Tooltip } from '@mantine/core';
import { IconBookmark, IconBookmarkFilled } from '@tabler/icons-react';
import { useRouter } from 'next/router';
import { useFeatureFlagEnabled } from 'posthog-js/react';

import { useAddBookmark } from '../../hooks/bookmarks/add';
import { useGetBookmarks } from '../../hooks/bookmarks/get';
import { useRemoveBookmark } from '../../hooks/bookmarks/remove';
import { useUser } from '../../hooks/useUser';

type BookmarkButtonProps = {
  hymnBook?: string;
  hymnNumber?: number | string;
  hymnSlug?: string;
};

export function BookmarkButton(props: BookmarkButtonProps = {}) {
  const router = useRouter();

  const hymnSlug = props.hymnSlug ?? String(router.query.slug);
  const hymnBook = props.hymnBook ?? String(router.query.hymnBook);
  const hymnNumber = props.hymnBook ? props.hymnNumber : hymnSlug.split('-')[0];

  const isBookmarksEnabled = useFeatureFlagEnabled('bookmarks');

  const { data: bookmarks, isLoading } = useGetBookmarks();

  const { user } = useUser();

  const { mutateAsync: addBookmark } = useAddBookmark();
  const { mutateAsync: removeBookmark } = useRemoveBookmark();

  const savedBookmark = bookmarks?.find(
    (bookmark) => bookmark.slug === hymnSlug && bookmark.hymnBook === hymnBook
  );
  const isBookmarked = Boolean(savedBookmark);

  const handleClick = async () => {
    const bookmark = {
      ...(hymnNumber === undefined ? {} : { number: Number(hymnNumber) }),
      slug: hymnSlug,
      hymnBook,
    };

    if (savedBookmark) {
      await removeBookmark(savedBookmark);
      return;
    }

    await addBookmark(bookmark);
  };

  if (!isBookmarksEnabled || isLoading || !user) {
    return null;
  }

  const tooltipLabel = isBookmarked ? 'Remover dos favoritos' : 'Adicionar aos favoritos';

  return (
    <Tooltip label={tooltipLabel}>
      <ActionIcon variant="subtle" onClick={handleClick} size="lg">
        {isBookmarked ? <IconBookmarkFilled stroke={1.5} /> : <IconBookmark stroke={1.5} />}
      </ActionIcon>
    </Tooltip>
  );
}

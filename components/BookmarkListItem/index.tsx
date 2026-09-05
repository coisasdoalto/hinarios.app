import { NavLink, Text } from '@mantine/core';
import Link from 'next/link';

import {
  HC_HYMN_BOOK_SLUG,
  HC_UNAVAILABLE_FAVORITE_MESSAGE,
  OTHER_SONGS_NAME,
  OTHER_SONGS_SLUG,
  isHymnBookVisible,
} from '../../contants';
import { useHymnBooks } from '../../context/HymnBooks';
import { useAccess } from '../../hooks/useAccess';
import { useHymn } from '../../hooks/useHymn';
import { Bookmark } from '../../types/database/Bookmark';
import { BookmarkListItemSkeleton } from './Skeleton';

export function BookmarkListItem({ bookmark }: { bookmark: Bookmark }) {
  const [hymnBooks] = useHymnBooks();
  const { canAccessHc, isLoading: isLoadingAccess } = useAccess();
  const isOtherSong = bookmark.hymnBook === OTHER_SONGS_SLUG;
  const canAccessHymn = isOtherSong || isHymnBookVisible(bookmark.hymnBook, canAccessHc);
  const hymnBook = hymnBooks?.find(({ slug }) => slug === bookmark.hymnBook);
  const indexedHymn = hymnBook?.index?.find(({ slug }) => slug === bookmark.slug);

  const { isLoading, data: hymn } = useHymn({
    hymnIdentifier: bookmark.number ?? bookmark.slug,
    hymnBook: bookmark.hymnBook,
  });

  const isLoadingHcAccess = bookmark.hymnBook === HC_HYMN_BOOK_SLUG && isLoadingAccess;

  if (isLoadingHcAccess || isLoading) return <BookmarkListItemSkeleton />;

  if (!canAccessHymn) {
    return (
      <NavLink
        label={`${bookmark.number}. Hinos e Cânticos`}
        description={HC_UNAVAILABLE_FAVORITE_MESSAGE}
        icon={<Text size="sm">{bookmark.number}</Text>}
        disabled
      />
    );
  }

  if (!hymn && !indexedHymn) return null;

  return (
    <NavLink
      key={bookmark.number}
      label={hymn?.title ?? indexedHymn?.title}
      description={hymn?.hymnBook.name ?? hymnBook?.name ?? (isOtherSong ? OTHER_SONGS_NAME : '')}
      icon={isOtherSong ? undefined : <Text size="sm">{bookmark.number}</Text>}
      component={Link}
      href={`/${bookmark.hymnBook}/${bookmark.slug}`}
    />
  );
}

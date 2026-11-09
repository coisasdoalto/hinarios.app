import { NavLink, Text } from '@mantine/core';
import Link from 'next/link';

import {
  HC_HYMN_BOOK_SLUG,
  HC_UNAVAILABLE_FAVORITE_MESSAGE,
  OTHER_SONGS_NAME,
  OTHER_SONGS_SLUG,
  isHymnBookVisible,
} from '../../contants';
import { useAccess } from '../../hooks/useAccess';
import { useHymnTitles } from '../../hooks/useHymnTitles';
import { Bookmark } from '../../types/database/Bookmark';
import { BookmarkListItemSkeleton } from './Skeleton';

export function BookmarkListItem({ bookmark }: { bookmark: Bookmark }) {
  const { data: titles, isLoading: isLoadingTitles } = useHymnTitles();
  const { canAccessHc, isLoading: isLoadingAccess } = useAccess();
  const isOtherSong = bookmark.hymnBook === OTHER_SONGS_SLUG;
  const canAccessHymn = isOtherSong || isHymnBookVisible(bookmark.hymnBook, canAccessHc);
  const hymnBook = titles?.[bookmark.hymnBook];
  const hymnTitle = hymnBook?.hymns[bookmark.slug];

  const isLoadingHcAccess = bookmark.hymnBook === HC_HYMN_BOOK_SLUG && isLoadingAccess;

  if (isLoadingHcAccess || isLoadingTitles) return <BookmarkListItemSkeleton />;

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

  if (!hymnTitle) return null;

  return (
    <NavLink
      key={bookmark.number}
      label={hymnTitle}
      description={hymnBook?.name ?? (isOtherSong ? OTHER_SONGS_NAME : '')}
      icon={isOtherSong ? undefined : <Text size="sm">{bookmark.number}</Text>}
      component={Link}
      href={`/${bookmark.hymnBook}/${bookmark.slug}`}
    />
  );
}

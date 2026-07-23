import { NavLink, Text } from '@mantine/core';
import Link from 'next/link';

import { HC_UNAVAILABLE_FAVORITE_MESSAGE, isHymnBookVisible } from '../../contants';
import { useHymnBooks } from '../../context/HymnBooks';
import { useAccess } from '../../hooks/useAccess';
import { useHymn } from '../../hooks/useHymn';
import { Bookmark } from '../../types/database/Bookmark';
import { BookmarkListItemSkeleton } from './Skeleton';

export function BookmarkListItem({ bookmark }: { bookmark: Bookmark }) {
  const [hymnBooks] = useHymnBooks();
  const { canAccessHc } = useAccess();
  const canAccessHymn = isHymnBookVisible(bookmark.hymnBook, canAccessHc);
  const hymnBook = hymnBooks?.find(({ slug }) => slug === bookmark.hymnBook);
  const indexedHymn = hymnBook?.index?.find(({ slug }) => slug === bookmark.slug);

  const { isLoading, data: hymn } = useHymn({
    hymnNumber: bookmark.number,
    hymnBook: bookmark.hymnBook,
  });

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

  if (isLoading) return <BookmarkListItemSkeleton />;
  if (!hymn && !indexedHymn) return null;

  return (
    <NavLink
      key={bookmark.number}
      label={hymn?.title ?? indexedHymn?.title}
      description={hymn?.hymnBook.name ?? hymnBook?.name}
      icon={<Text size="sm">{bookmark.number}</Text>}
      component={Link}
      href={`${bookmark.hymnBook}/${bookmark.slug}`}
    />
  );
}

import { Alert, Container, Group, Loader, Space, Text, Title } from '@mantine/core';
import { GetStaticProps } from 'next';
import Head from 'next/head';
import { useGetBookmarks } from '../hooks/bookmarks/get';

import BackButton from '../components/BackButton/BackButton';
import { BookmarkListItem } from '../components/BookmarkListItem';
import {
  HC_HYMN_BOOK_SLUG,
  HC_UNAVAILABLE_ALERT_TITLE,
  HC_UNAVAILABLE_MESSAGE,
  isHymnBookVisible,
} from '../contants';
import { useHymnBooksSave } from '../context/HymnBooks';
import getHymnBooks from '../data/getHymnBooks';
import { useAccess } from '../hooks/useAccess';
import { HymnBook } from '../schemas/hymnBook';

type PageProps = { hymnBooks: HymnBook[] };

export default function Bookmarks({ hymnBooks }: PageProps) {
  useHymnBooksSave(hymnBooks);

  const query = useGetBookmarks();

  const { data, isLoading } = query;

  const bookmarks = data ?? [];
  const { canAccessHc } = useAccess();
  const hasUnavailableHymns = bookmarks.some(
    ({ hymnBook }) => hymnBook === HC_HYMN_BOOK_SLUG && !isHymnBookVisible(hymnBook, canAccessHc)
  );

  const hasBookmarks = bookmarks.length > 0;

  return (
    <>
      <Head>
        <title>Favoritos | Hinários</title>
      </Head>

      <Container size="xs">
        <BackButton to="/" />

        <Space h="md" />

        <Group>
          <Title order={1} size="h2">
            Favoritos
          </Title>
        </Group>

        <Space h="lg" />

        {hasUnavailableHymns && (
          <Alert title={HC_UNAVAILABLE_ALERT_TITLE} color="blue" mb="md">
            {HC_UNAVAILABLE_MESSAGE}
          </Alert>
        )}

        {bookmarks.map((bookmark) => (
          <BookmarkListItem key={bookmark.number} bookmark={bookmark} />
        ))}

        {!isLoading && !hasBookmarks && <Text>Você ainda não tem hinos favoritos</Text>}

        {isLoading && <Loader />}
      </Container>
    </>
  );
}

export const getStaticProps: GetStaticProps<PageProps> = async () => {
  const hymnBooks = await getHymnBooks();

  return { props: { hymnBooks } };
};

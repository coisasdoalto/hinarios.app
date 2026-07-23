import { Alert, Card, Group, Stack, Text } from '@mantine/core';
import { GetStaticProps } from 'next';
import Link from 'next/link';

import {
  HC_HYMN_BOOK_SLUG,
  HC_UNAVAILABLE_ALERT_TITLE,
  HC_UNAVAILABLE_MESSAGE,
  isHymnBookVisible,
} from '../contants';
import { useHymnBooks, useHymnBooksSave } from '../context/HymnBooks';
import getHymnBooks from '../data/getHymnBooks';
import { useAccess } from '../hooks/useAccess';
import { HymnBook } from '../schemas/hymnBook';

type PageProps = { hymnBooks: HymnBook[] };

export default function Home({ hymnBooks }: PageProps) {
  useHymnBooksSave(hymnBooks);

  const [orderedHymnBooks] = useHymnBooks();
  const { canAccessHc } = useAccess();
  const canViewHymnBook = isHymnBookVisible(HC_HYMN_BOOK_SLUG, canAccessHc);

  return (
    <Stack spacing="xl">
      {!canViewHymnBook && (
        <Alert title={HC_UNAVAILABLE_ALERT_TITLE} color="blue">
          {HC_UNAVAILABLE_MESSAGE}
        </Alert>
      )}

      <Group position="center">
        {orderedHymnBooks?.map((hymnBook) => (
          <Card key={hymnBook.slug} shadow="sm" p="xl" component={Link} href={`/${hymnBook.slug}`}>
            <Text weight={500} size="lg" m={0}>
              {hymnBook.name}
            </Text>
          </Card>
        ))}
      </Group>
    </Stack>
  );
}

export const getStaticProps: GetStaticProps<PageProps> = async () => {
  const hymnBooks = await getHymnBooks();

  return { props: { hymnBooks } };
};

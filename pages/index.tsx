import { Card, Group, Text } from '@mantine/core';
import { GetStaticProps } from 'next';
import Link from 'next/link';

import { HYMN_BOOKS_ORDER } from '../contants/';
import { useHymnBooksSave } from '../context/HymnBooks';
import getHymnBooks from '../data/getHymnBooks';
import { HymnBook } from '../schemas/hymnBook';

type PageProps = { hymnBooks: HymnBook[] };

export default function Home({ hymnBooks }: PageProps) {
  useHymnBooksSave(hymnBooks);

  const orderedHymnBooks = [...hymnBooks].sort((a, b) => {
    const firstItemIndex = HYMN_BOOKS_ORDER.indexOf(a.slug);
    const secondItemIndex = HYMN_BOOKS_ORDER.indexOf(b.slug);

    if (firstItemIndex === -1) return 1;
    if (secondItemIndex === -1) return -1;
    if (firstItemIndex !== secondItemIndex) return firstItemIndex - secondItemIndex;

    return a.name.localeCompare(b.name);
  });

  return (
    <Group position="center">
      {orderedHymnBooks.map((hymnBook) => (
        <Card key={hymnBook.slug} shadow="sm" p="xl" component={Link} href={`/${hymnBook.slug}`}>
          <Text weight={500} size="lg" m={0}>
            {hymnBook.name}
          </Text>
        </Card>
      ))}
    </Group>
  );
}

export const getStaticProps: GetStaticProps<PageProps> = async () => {
  const hymnBooks = await getHymnBooks();

  return { props: { hymnBooks } };
};

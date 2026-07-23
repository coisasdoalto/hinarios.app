import { Alert, Card, Group, Stack, Text } from '@mantine/core';
import { GetStaticProps } from 'next';
import Link from 'next/link';

import { useHymnBooks, useHymnBooksSave } from '../context/HymnBooks';
import getHymnBooks from '../data/getHymnBooks';
import { HymnBook } from '../schemas/hymnBook';

type PageProps = { hymnBooks: HymnBook[] };

export default function Home({ hymnBooks }: PageProps) {
  useHymnBooksSave(hymnBooks);

  const [orderedHymnBooks] = useHymnBooks();

  return (
    <Stack spacing="xl">
      <Alert title="Hinos e Cânticos temporariamente indisponível" color="blue">
        Estamos trabalhando junto aos detentores dos direitos da editora para viabilizar a
        publicação do HC no app. Agradecemos a compreensão.
      </Alert>

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

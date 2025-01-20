import {
  ActionIcon,
  Badge,
  Card,
  Collapse,
  Container,
  Flex,
  Group,
  Paper,
  Text,
} from '@mantine/core';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import { useHymnBooksSave } from '../context/HymnBooks';
import getHymnBooks from '../data/getHymnBooks';
import { HymnBook } from '../schemas/hymnBook';
import { IconX } from '@tabler/icons';
import { useLocalStorage } from '@mantine/hooks';

type PageProps = { hymnBooks: HymnBook[] };

export default function Home({ hymnBooks }: PageProps) {
  useHymnBooksSave(hymnBooks);

  const [dismissed, setDismissed] = useLocalStorage({
    key: 'UpdateNewSearchDimissed',
    deserialize: (value) => Boolean(value),
    defaultValue: false,
  });

  return (
    <>
      <Collapse in={!dismissed}>
        <Container size="xs" mb={35}>
          <Paper p={20} withBorder>
            <Flex mb={10} justify="space-between" align="center">
              <Badge>Novidade</Badge>
              <ActionIcon onClick={() => setDismissed(true)}>
                <IconX size={18} />
              </ActionIcon>
            </Flex>
            Implementamos um novo sistema de busca, mais rápido e mais preciso! Caso encontre algum
            problema deixe um feedback abaixo.
          </Paper>
        </Container>
      </Collapse>

      <Group position="center">
        {hymnBooks.map((hymnBook) => (
          <Card key={hymnBook.slug} shadow="sm" p="xl" component={Link} href={`/${hymnBook.slug}`}>
            <Text weight={500} size="lg" m={0}>
              {hymnBook.name}
            </Text>
          </Card>
        ))}
      </Group>
    </>
  );
}

export const getStaticProps: GetStaticProps<PageProps> = async () => {
  const hymnBooks = await getHymnBooks();

  return { props: { hymnBooks } };
};

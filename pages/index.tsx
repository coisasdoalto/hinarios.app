import {
  Alert,
  Card,
  Collapse,
  Container,
  Group,
  Text,
} from '@mantine/core';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import { useHymnBooksSave } from '../context/HymnBooks';
import getHymnBooks from '../data/getHymnBooks';
import { HymnBook } from '../schemas/hymnBook';
import { IconAlertCircle } from '@tabler/icons';
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
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Nova busca!"
            color="indigo"
            withCloseButton
            onClose={() => setDismissed(true)}
          >
            Implementamos um <strong>novo sistema de busca</strong>, mais rápido e mais preciso!
            Caso encontre algum problema deixe um <strong>feedback abaixo</strong>.
          </Alert>
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

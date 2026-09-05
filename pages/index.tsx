import { Alert, Card, Group, Stack, Text, Title } from '@mantine/core';
import { IconMusic } from '@tabler/icons-react';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import { useFeatureFlagEnabled } from 'posthog-js/react';

import {
  HC_HYMN_BOOK_SLUG,
  HC_UNAVAILABLE_ALERT_TITLE,
  HC_UNAVAILABLE_MESSAGE,
  OTHER_SONGS_NAME,
  OTHER_SONGS_SLUG,
  OTHER_SONGS_FEATURE_FLAG,
  isHymnBookVisible,
} from '../contants';
import { AccessLoading } from '../components/AccessLoading';
import { useHymnBooks, useHymnBooksSave } from '../context/HymnBooks';
import getHymnBooks from '../data/getHymnBooks';
import { useAccess } from '../hooks/useAccess';
import { HymnBook } from '../schemas/hymnBook';

type PageProps = { hymnBooks: HymnBook[] };

export default function Home({ hymnBooks }: PageProps) {
  useHymnBooksSave(hymnBooks);

  const [orderedHymnBooks] = useHymnBooks();
  const { canAccessHc, isLoading } = useAccess();
  const isOtherSongsEnabled = useFeatureFlagEnabled(OTHER_SONGS_FEATURE_FLAG);
  const canViewHymnBook = isHymnBookVisible(HC_HYMN_BOOK_SLUG, canAccessHc);

  if (isLoading) return <AccessLoading />;

  return (
    <Stack spacing="xl">
      {!canViewHymnBook && (
        <Alert title={HC_UNAVAILABLE_ALERT_TITLE} color="blue">
          {HC_UNAVAILABLE_MESSAGE}
        </Alert>
      )}

      <Stack spacing="sm">
        <Title order={2} size="h3" align="center">
          Hinários
        </Title>
        <Group position="center">
          {orderedHymnBooks?.map((hymnBook) => (
            <Card
              key={hymnBook.slug}
              shadow="sm"
              p="xl"
              component={Link}
              href={`/${hymnBook.slug}`}
            >
              <Text weight={500} size="lg" m={0}>
                {hymnBook.name}
              </Text>
            </Card>
          ))}
        </Group>
      </Stack>

      {isOtherSongsEnabled && (
        <Group position="center">
          <Card
            shadow="sm"
            p="xl"
            component={Link}
            href={`/${OTHER_SONGS_SLUG}`}
            withBorder
            sx={(theme) => ({
              width: 'min(100%, 420px)',
              transition: 'transform 150ms ease, box-shadow 150ms ease',
              '&:hover': {
                boxShadow: theme.shadows.md,
                transform: 'translateY(-2px)',
              },
            })}
          >
            <Group noWrap>
              <IconMusic size={28} stroke={1.5} />
              <div>
                <Text weight={600} size="lg">
                  {OTHER_SONGS_NAME}
                </Text>
                <Text color="dimmed" size="sm">
                  Canções que não pertencem a um hinário específico
                </Text>
              </div>
            </Group>
          </Card>
        </Group>
      )}
    </Stack>
  );
}

export const getStaticProps: GetStaticProps<PageProps> = async () => {
  const hymnBooks = await getHymnBooks();

  return { props: { hymnBooks } };
};

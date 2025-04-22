import { ActionIcon, DefaultProps, Group, MediaQuery, Text, UnstyledButton } from '@mantine/core';
import { useOs } from '@mantine/hooks';
import type { SpotlightAction } from '@mantine/spotlight';
import { SpotlightProvider, openSpotlight } from '@mantine/spotlight';
import { IconSearch } from '@tabler/icons';
import flexsearch from 'flexsearch';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import keys from '../../search/_keys.json';
import useStyles from './SearchControl.styles';
import { CustomAction } from './CustomAction';
import { useHymnBooks } from 'context/HymnBooks';

const searchIndex = new flexsearch.Document({
  document: {
    id: 'id',
    index: ['number', 'title', 'body'],
  },
});

keys.forEach(async (key) => {
  const data = (await import(`../../search/${key}.json`)).default;

  searchIndex.import(key, data);
});

interface SearchControlProps extends DefaultProps, React.ComponentPropsWithoutRef<'button'> {
  onClick(): void;
}

export function SearchControl({ className, ...others }: SearchControlProps) {
  const { classes, cx } = useStyles();

  const [mac, setMac] = useState(false);

  const os = useOs();

  useEffect(() => {
    if (os === 'macos') {
      return setMac(true);
    }

    return setMac(false);
  }, [os]);

  return (
    <>
      <MediaQuery smallerThan="sm" styles={{ display: 'none' }}>
        <UnstyledButton {...others} className={cx(classes.root, className)}>
          <Group spacing="xs">
            <IconSearch size={14} stroke={1.5} />
            <Text size="sm" color="dimmed" pr={80}>
              Buscar
            </Text>
            <Text weight={700} className={classes.shortcut}>
              {mac ? '⌘' : 'Ctrl'} + K
            </Text>
          </Group>
        </UnstyledButton>
      </MediaQuery>
      <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
        <ActionIcon variant="outline" {...others}>
          <IconSearch size={18} stroke={1.5} />
        </ActionIcon>
      </MediaQuery>
    </>
  );
}

function docCheck(
  doc: unknown
): doc is { title: string; body: string; slug: string; hymnBookName: string } {
  if (doc) {
    return true;
  }
  return false;
}

function Search() {
  const router = useRouter();

  const [hymnBooks] = useHymnBooks();

  const [actions, setActions] = useState<SpotlightAction[]>([]);

  const onQueryChange = async (query: string) => {
    const queryAsNumber = parseInt(query, 10);

    if (!Number.isNaN(queryAsNumber)) {
      const regex = new RegExp(`^${queryAsNumber}`);

      const results = hymnBooks
        ?.flatMap((hymnBook) => {
          const actions = hymnBook.index
            ?.filter((hymn) => regex.test(hymn.slug))
            .map((hymn) => {
              const action: SpotlightAction = {
                id: hymn.slug,
                title: `${hymn.number}. ${hymn.title}`,
                description: `@@@${hymn.number}@@@. ${hymn.title}`,
                onTrigger: () => router.push(`/${hymnBook.slug}/${hymn.slug}`),
                group: hymnBook.name,
              };

              return action;
            });

          return actions;
        })
        .filter((item): item is SpotlightAction => {
          return Boolean(item);
        });

      setActions(results ?? []);
      return;
    }

    const searchResultsByIndex = searchIndex.search(query, {
      index: ['body', 'title'],
      limit: 10,
      suggest: true,
      enrich: true,
      highlight: '@@@$1@@@',
    });

    if (!Array.isArray(searchResultsByIndex)) {
      return;
    }

    const filteredData: SpotlightAction[] = searchResultsByIndex
      .flatMap((searchResultByIndex) => {
        const hasResult = 'result' in searchResultByIndex;

        if (!hasResult) {
          return null;
        }

        return searchResultByIndex.result.map((result) => {
          if (typeof result === 'string' || typeof result === 'number') {
            return null;
          }

          const doc = result.doc;

          if (!docCheck(doc)) {
            return null;
          }

          // Gets 3 words before the first highlight (@@@term@@@), and the rest of the string
          const description = result.highlight?.match(/(?:\S+\s+){0,3}@@@.+@@@.*/)?.[0];

          const action: SpotlightAction = {
            id: `${doc.title}${description}`,
            title: doc.title,
            description,
            onTrigger: () => router.push(`/${result.id}`),
            group: doc.hymnBookName,
          };

          return action;
        });
      })
      .filter((item): item is SpotlightAction => {
        return Boolean(item);
      });

    setActions(filteredData);
  };

  return (
    <SpotlightProvider
      actions={actions}
      actionComponent={CustomAction}
      searchIcon={<IconSearch size={18} />}
      searchPlaceholder="Buscar..."
      shortcut={['mod + P', 'mod + K', '/']}
      nothingFoundMessage="Nada encontrado..."
      onQueryChange={onQueryChange}
      filter={() => actions}
    >
      <SearchControl onClick={() => openSpotlight()} />
    </SpotlightProvider>
  );
}

export default Search;

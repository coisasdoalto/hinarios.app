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
import { debug } from 'utils/debug';
import { performTextualSearch } from './performTextualSearch';
import { performNumericSearch } from './performNumericSearch';

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

function Search() {
  const router = useRouter();

  const [hymnBooks] = useHymnBooks();

  const [actions, setActions] = useState<SpotlightAction[]>([]);

  debug('search results: %O', actions);

  const onQueryChange = async (query: string) => {
    const queryAsNumber = parseInt(query, 10);

    if (!Number.isNaN(queryAsNumber)) {
      const results = performNumericSearch({ hymnBooks, queryAsNumber, router });

      setActions(results ?? []);
      return;
    }

    const filteredData = performTextualSearch({
      searchIndex,
      query,
      router,
    });

    setActions(filteredData || []);
  };

  return (
    <SpotlightProvider
      limit={Infinity}
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

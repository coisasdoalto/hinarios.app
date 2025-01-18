import { ActionIcon, DefaultProps, Group, MediaQuery, Text, UnstyledButton } from '@mantine/core';
import { useOs } from '@mantine/hooks';
import type { SpotlightAction } from '@mantine/spotlight';
import { SpotlightProvider, openSpotlight } from '@mantine/spotlight';
import { IconSearch } from '@tabler/icons';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import keys from '../../search/_keys.json';
import useStyles from './SearchControl.styles';
import flexsearch from 'flexsearch';

const searchIndex = new flexsearch.Document<
  { title: string; body: string; slug: string; hymnBookSlug: string },
  true
>({
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

  const [actions, setActions] = useState<SpotlightAction[]>([]);

  const onQueryChange = async (query: string) => {
    const searchResultsByIndex = searchIndex.search<true>(query, undefined, {
      index: ['body', 'title'],
      limit: 10,
      suggest: true,
      enrich: true,
    });

    const filteredData: SpotlightAction[] = searchResultsByIndex
      .map((searchResultByIndex) =>
        searchResultByIndex.result.map((result) => {
          // console.log('found', result);

          return {
            id: String(result.id),
            title: String(result.doc.title),
            description: String(result.doc.body),
            onTrigger: () => router.push(`/${result.id}`),
          };
        })
      )
      .flat();

    setActions(filteredData);
  };

  return (
    <SpotlightProvider
      actions={actions}
      searchIcon={<IconSearch size={18} />}
      searchPlaceholder="Buscar..."
      shortcut={['mod + P', 'mod + K', '/']}
      nothingFoundMessage="Nada encontrado..."
      onQueryChange={onQueryChange}
    >
      <SearchControl onClick={() => openSpotlight()} />
    </SpotlightProvider>
  );
}

export default Search;

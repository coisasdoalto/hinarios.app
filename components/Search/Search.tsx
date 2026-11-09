import { ActionIcon, DefaultProps, Group, MediaQuery, Text, UnstyledButton } from '@mantine/core';
import { useOs } from '@mantine/hooks';
import type { SpotlightAction } from '@mantine/spotlight';
import { SpotlightProvider, openSpotlight } from '@mantine/spotlight';
import { IconSearch } from '@tabler/icons';
import flexsearch from 'flexsearch';
import { useRouter } from 'next/router';
import { useFeatureFlagEnabled } from '../../hooks/useFeatureFlagEnabled';
import { useEffect, useState } from 'react';
import keys from '../../search/_keys.json';
import useStyles from './SearchControl.styles';
import { CustomAction } from './CustomAction';
import { useHymnBooks } from 'context/HymnBooks';
import { useAccess } from 'hooks/useAccess';
import { debug } from 'utils/debug';
import { performTextualSearch } from './performTextualSearch';
import { performNumericSearch } from './performNumericSearch';
import { hcGet } from '../../utils/hcRequest';
import { OTHER_SONGS_FEATURE_FLAG } from 'contants';

const searchIndex = new flexsearch.Document({
  document: {
    id: 'id',
    index: ['number', 'title', 'body'],
  },
});

// HC has its own index: its shard keys match the public ones, so importing both into one index would overwrite it.
const hcSearchIndex = new flexsearch.Document({
  document: {
    id: 'id',
    index: ['number', 'title', 'body'],
  },
});

keys.forEach(async (key) => {
  const data = (await import(`../../search/${key}.json`)).default;

  searchIndex.import(key, data);
});

let hcSearchRequest: Promise<void> | undefined;

/**
 * Adds the HC shards to the index. They come from the protected API, so this only runs for
 * users that the server allows to see HC, and the request is shared between mounts.
 */
function loadHcSearchIndex() {
  hcSearchRequest ??= hcGet<{ keys: string[]; shards: Record<string, unknown> }>('/api/hc/search')
    .then(({ data }) => {
      data.keys.forEach((key) => hcSearchIndex.import(key, data.shards[key] as never));
    })
    .catch(() => {
      hcSearchRequest = undefined;
    });

  return hcSearchRequest;
}

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
  const { canAccessHc } = useAccess();
  const isOtherSongsEnabled = useFeatureFlagEnabled(OTHER_SONGS_FEATURE_FLAG);

  const [actions, setActions] = useState<SpotlightAction[]>([]);

  debug('search results: %O', actions);

  const onQueryChange = async (query: string) => {
    const queryAsNumber = parseInt(query, 10);

    if (!Number.isNaN(queryAsNumber)) {
      const results = performNumericSearch({ hymnBooks, queryAsNumber, router });

      setActions(results ?? []);
      return;
    }

    const searchOptions = {
      query,
      router,
      canAccessHc,
      canAccessOtherSongs: Boolean(isOtherSongsEnabled),
    };
    if (canAccessHc) await loadHcSearchIndex();

    const filteredData = [
      ...(performTextualSearch({ searchIndex, ...searchOptions }) ?? []),
      ...(canAccessHc
        ? performTextualSearch({ searchIndex: hcSearchIndex, ...searchOptions }) ?? []
        : []),
    ];

    setActions(filteredData);
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

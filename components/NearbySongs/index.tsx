import { Affix, ActionIcon, Drawer, NavLink } from '@mantine/core';
import { IconGlobeFilled } from '@tabler/icons-react';
import { useProximityHymns } from 'hooks/useProximityHymns';
import Link from 'next/link';
import { useFeatureFlagEnabled } from 'posthog-js/react';
import { useState } from 'react';

export function NearbySongs() {
  const { data: proximityHymns } = useProximityHymns();

  const [opened, setOpened] = useState(false);

  const isNearbySongsEnabled = useFeatureFlagEnabled('nearby-songs');

  if (!isNearbySongsEnabled || !proximityHymns?.length) {
    return null;
  }

  return (
    <>
      <Affix
        position={{
          bottom: '30px',
          right: '30px',
        }}
        zIndex={2}
      >
        <ActionIcon
          title="Hinos próximos a você"
          onClick={() => setOpened(true)}
          radius="xl"
          variant="filled"
          size={60}
        >
          <IconGlobeFilled />
        </ActionIcon>
      </Affix>

      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        title="Próximos de você"
        position="bottom"
        padding="md"
      >
        {proximityHymns?.map((item) => (
          <NavLink
            key={item.hymn_slug}
            label={`${item.hymn_number} - ${item.hymn_title}`}
            component={Link}
            href={`/${item.hymn_book_slug}/${item.hymn_slug}`}
            onClick={() => setOpened(false)}
          />
        ))}
      </Drawer>
    </>
  );
}

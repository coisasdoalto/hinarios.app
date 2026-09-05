import { Affix, ActionIcon, Drawer, NavLink } from '@mantine/core';
import { IconGlobeFilled } from '@tabler/icons-react';
import { useProximityHymns } from 'hooks/useProximityHymns';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useFeatureFlagEnabled, usePostHog } from 'posthog-js/react';
import { useState } from 'react';
import { OTHER_SONGS_FEATURE_FLAG, OTHER_SONGS_SLUG } from 'contants';

export function NearbySongs() {
  const { data: proximityHymns } = useProximityHymns();
  const router = useRouter();

  const [opened, setOpened] = useState(false);

  const isNearbySongsEnabled = useFeatureFlagEnabled('nearby-songs');
  const isHymnBottomNavigationEnabled = useFeatureFlagEnabled('hymn-bottom-navigation');
  const isOtherSongsEnabled = useFeatureFlagEnabled(OTHER_SONGS_FEATURE_FLAG);
  const visibleProximityHymns = proximityHymns?.filter(
    (item) => item.hymn_book_slug !== OTHER_SONGS_SLUG || isOtherSongsEnabled
  );

  const posthog = usePostHog();
  const isHymnPage = router.pathname === '/[hymnBook]/[slug]';

  if (!isNearbySongsEnabled || !visibleProximityHymns?.length) {
    return null;
  }

  return (
    <>
      <Affix
        position={{
          bottom: isHymnPage && isHymnBottomNavigationEnabled ? '106px' : '30px',
          right: '30px',
        }}
        zIndex={2}
      >
        <ActionIcon
          title="Hinos próximos a você"
          onClick={() => {
            setOpened(true);
            posthog.capture('nearby_songs_click');
          }}
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
        {visibleProximityHymns.map((item) => (
          <NavLink
            key={item.hymn_slug}
            label={
              item.hymn_book_slug === OTHER_SONGS_SLUG
                ? item.hymn_title
                : `${item.hymn_number} - ${item.hymn_title}`
            }
            component={Link}
            href={`/${item.hymn_book_slug}/${item.hymn_slug}`}
            onClick={() => setOpened(false)}
          />
        ))}
      </Drawer>
    </>
  );
}

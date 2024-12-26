import { Affix, ActionIcon, Drawer, NavLink } from '@mantine/core';
import { IconRadar2 } from '@tabler/icons';
import { useProximityHymns } from 'hooks/useProximityHymns';
import Link from 'next/link';
import { useState } from 'react';
import LazyLoad from 'react-lazyload';

export function NearbySongs() {
  const { data: proximityHymns } = useProximityHymns();

  const [opened, setOpened] = useState(false);

  return (
    <>
      <Affix
        position={{
          bottom: '30px',
          right: '30px',
        }}
        zIndex={2}
      >
        <ActionIcon onClick={() => setOpened(true)} radius="xl" variant="filled" size={60}>
          <IconRadar2 />
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
            //   description={item.subtitle}
            // rightSection={
            //   <Group>
            //     <IconStar size={16} stroke={1.5} />
            //     <IconHeadphones size={16} stroke={1.5} onClick={() => console.log('play')} />
            //   </Group>
            // }
            //   icon={
            //     <Text sx={{ minWidth: 29, textAlign: 'right' }} size="sm">
            //       {item.number}
            //     </Text>
            //   }
            //   onClick={() => setActive(index)}
            component={Link}
            href={`/${item.hymn_book_slug}/${item.hymn_slug}`}
            onClick={() => setOpened(false)}
          />
        ))}
      </Drawer>
    </>
  );
}

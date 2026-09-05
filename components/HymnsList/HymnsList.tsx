import { Box, Group, NavLink, Space, Text, Title } from '@mantine/core';
import Link from 'next/link';
import { Fragment, useState } from 'react';
import LazyLoad from 'react-lazyload';
import BackButton from '../BackButton/BackButton';

type SongListItem = {
  number?: number | string;
  title: string;
  subtitle?: string;
  slug: string;
};

function HymnsList({
  hymnsIndex,
  hymnBook,
  showNumbers = true,
}: {
  hymnsIndex: SongListItem[];
  hymnBook: { name: string; slug: string };
  showNumbers?: boolean;
}) {
  const [active, setActive] = useState(0);

  const items = hymnsIndex.map((item, index) => (
    <Fragment key={item.slug}>
      <LazyLoad height={59.39} offset={200} once>
        <NavLink
          key={item.slug}
          active={index === active}
          label={item.title}
          description={item.subtitle}
          // rightSection={
          //   <Group>
          //     <IconStar size={16} stroke={1.5} />
          //     <IconHeadphones size={16} stroke={1.5} onClick={() => console.log('play')} />
          //   </Group>
          // }
          icon={
            showNumbers ? (
              <Text sx={{ minWidth: 29, textAlign: 'right' }} size="sm">
                {item.number}
              </Text>
            ) : undefined
          }
          onClick={() => setActive(index)}
          component={Link}
          href={`/${hymnBook.slug}/${item.slug}`}
        />
      </LazyLoad>
    </Fragment>
  ));

  return (
    <>
      <Group>
        <BackButton to="/" />

        <Title order={1} size="h2">
          {hymnBook.name}
        </Title>
      </Group>

      <Space h="lg" />

      <Box sx={{ display: 'flex', flexDirection: 'column' }}>{items}</Box>
    </>
  );
}

export default HymnsList;

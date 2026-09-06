import {
  Box,
  Center,
  Container,
  Flex,
  Group,
  MantineSize,
  SegmentedControl,
  Space,
  Title,
} from '@mantine/core';
import { IconLayoutGrid, IconList } from '@tabler/icons-react';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { z } from 'zod';

import { useLocalStorage } from '@mantine/hooks';
import { HymnBottomNavigation } from 'components/HymnBottomNavigation';
import { HymnLyrics, LyricsLayout } from 'components/HymnLyrics';
import { SlideMode } from 'components/SlideMode';
import { UpdateHymnButton } from 'components/UpdateHymnButton';
import { HC_HYMN_BOOK_SLUG, isHymnBookVisible } from 'contants';
import { useGeolocationFromIp } from 'hooks/useGeolocationFromIp';
import { supabase } from 'supabase';
import { AccessLoading } from '../../components/AccessLoading';
import BackButton from '../../components/BackButton/BackButton';
import { BookmarkButton } from '../../components/BookmarkButton';
import { HymnBookUnavailable } from '../../components/HymnBookUnavailable';
import { useHymnBooks, useHymnBooksSave } from '../../context/HymnBooks';
import getHymnBooks from '../../data/getHymnBooks';
import getHymnsIndex from '../../data/getHymnsIndex';
import getParsedData from '../../data/getParsedData';
import { useAccess } from '../../hooks/useAccess';
import { Hymn, hymnSchema } from '../../schemas/hymn';
import { HymnBook } from '../../schemas/hymnBook';
import { OtherSong } from '../../schemas/otherSong';
import { HymnNavigationItem } from '../../components/HymnBottomNavigation';

const validateFontSize = (fontSize: string): fontSize is MantineSize => /md|lg|xl/.test(fontSize);

const visuallyHiddenStyles = {
  border: 0,
  clip: 'rect(0 0 0 0)',
  height: 1,
  margin: -1,
  overflow: 'hidden',
  padding: 0,
  position: 'absolute' as const,
  whiteSpace: 'nowrap' as const,
  width: 1,
};

export type HymnViewPageProps = {
  content: Hymn | OtherSong;
  hymnBooks: HymnBook[];
  hymnBook: string;
  nextHymn: HymnNavigationItem | null;
  previousHymn: HymnNavigationItem | null;
  backPath?: string;
  routeBase?: string;
  showSongNumber?: boolean;
  allowEditing?: boolean;
};

export default function HymnView(props: HymnViewPageProps) {
  const {
    content,
    hymnBook: hymnBookSlug,
    nextHymn,
    previousHymn,
    backPath,
    routeBase = hymnBookSlug,
    showSongNumber = true,
    allowEditing = true,
  } = props;
  const { title, subtitle, lyrics } = content;
  const number = 'number' in content ? content.number : undefined;

  useHymnBooksSave(props.hymnBooks);
  const { canAccessHc, isLoading: isLoadingAccess } = useAccess();
  const canViewHymnBook = isHymnBookVisible(hymnBookSlug, canAccessHc);

  const [fontSize, setFontSize] = useState<MantineSize>('md');
  const [lyricsLayout, setLyricsLayout] = useLocalStorage<LyricsLayout>({
    key: 'lyricsLayout',
    defaultValue: 'grid',
  });

  useEffect(() => {
    const localStorageFontSize = localStorage.getItem('fontSize') || '';

    if (validateFontSize(localStorageFontSize)) {
      setFontSize(localStorageFontSize);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('fontSize', fontSize);
  }, [fontSize]);

  const router = useRouter();

  const [hymnBooks] = useHymnBooks();

  const hymnBook = hymnBooks?.find((item) => item.slug === hymnBookSlug);

  const { data: geolocation, isLoading } = useGeolocationFromIp();

  const [visitId, setVisitId] = useLocalStorage({
    key: 'visitId',
    deserialize: (value) => Number(value),
    defaultValue: null,
  });

  useEffect(() => {
    if (isLoading || !geolocation || !canViewHymnBook) return;

    const hymnBook = String(router.query.hymnBook);
    const slug = String(router.query.slug);

    (async () => {
      const ipData = await supabase
        .from('hymns_visits')
        .insert({
          hymn_slug: slug,
          hymn_book_slug: hymnBook,
          latitude: geolocation.latitude,
          longitude: geolocation.longitude,
          hymn_title: title,
          hymn_number: number === undefined ? '' : String(number),
        })
        .select()
        .single();

      if (ipData.error) return;

      setVisitId(ipData.data.id);
      console.log('Saving visit');
    })();

    return () => {
      (async () => {
        if (!visitId) return;
        await supabase.from('hymns_visits').delete().eq('id', visitId);
        console.log('Deleting visit');
      })();
    };
  }, [canViewHymnBook, isLoading]);

  if (hymnBookSlug === HC_HYMN_BOOK_SLUG && isLoadingAccess) {
    return <AccessLoading />;
  }

  if (!canViewHymnBook) {
    return <HymnBookUnavailable />;
  }

  return (
    <>
      <Head>
        <title>{`${showSongNumber ? `${number}. ` : ''}${title} | Hinários`}</title>
      </Head>

      <Container size="lg">
        {/* <Title order={2} size="h3">
        {hymnBook?.name
      </Title> */}
        <Flex justify="space-between">
          <BackButton to={backPath ?? hymnBook?.slug} />

          <Group>
            <BookmarkButton
              hymnBook={hymnBookSlug}
              hymnNumber={number}
              hymnSlug={String(router.query.slug)}
            />
            <SlideMode number={number} title={title} lyrics={lyrics} showNumber={showSongNumber} />
            {allowEditing && <UpdateHymnButton />}
          </Group>
        </Flex>
        <Space h="md" />
        <Flex align="flex-start" gap="sm">
          <div>
            <Title order={1} size="h2">
              {showSongNumber ? `${number}. ${title}` : title}
            </Title>
            {subtitle && (
              <Title order={5} color="dimmed" italic>
                {subtitle}
              </Title>
            )}
          </div>
        </Flex>
        <Space h="md" />
        <Group position="center" spacing="sm">
          <SegmentedControl
            aria-label="Tamanho da letra"
            value={fontSize}
            onChange={(value: MantineSize) => setFontSize(value)}
            data={[
              { label: 'Pequeno', value: 'md' },
              { label: 'Médio', value: 'lg' },
              { label: 'Grande', value: 'xl' },
            ]}
          />
          <Box
            sx={(theme) => ({
              display: 'none',
              [theme.fn.largerThan('md')]: { display: 'block' },
            })}
          >
            <SegmentedControl
              aria-label="Layout da letra"
              value={lyricsLayout}
              onChange={(value: LyricsLayout) => setLyricsLayout(value)}
              data={[
                {
                  label: (
                    <Center title="Visualização normal">
                      <IconList aria-hidden size={18} stroke={1.8} />
                      <span style={visuallyHiddenStyles}>Normal</span>
                    </Center>
                  ),
                  value: 'normal',
                },
                {
                  label: (
                    <Center title="Visualização em grade">
                      <IconLayoutGrid aria-hidden size={18} stroke={1.8} />
                      <span style={visuallyHiddenStyles}>Grade</span>
                    </Center>
                  ),
                  value: 'grid',
                },
              ]}
            />
          </Box>
        </Group>

        <HymnLyrics fontSize={fontSize} layout={lyricsLayout} lyrics={lyrics} />

        {hymnBook?.slug === 'hinos-e-canticos' ? (
          <>
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <audio
              style={{ width: '100%', marginTop: 30 }}
              controls
              src={`https://pub-2792cfba2bfd44b7bfe9fcfbd02cbfcc.r2.dev/variant1/${number}.mp3`}
            />

            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <audio
              style={{ width: '100%', marginTop: 10 }}
              controls
              src={`https://pub-2792cfba2bfd44b7bfe9fcfbd02cbfcc.r2.dev/variant2/${number}.mp3`}
            />
          </>
        ) : null}

        <HymnBottomNavigation
          currentHymnNumber={number}
          hymnBookSlug={routeBase}
          previousHymn={previousHymn}
          nextHymn={nextHymn}
          showNumbers={showSongNumber}
        />
      </Container>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const hymnBooks = await getHymnBooks();

  const allPaths = (
    await Promise.all(
      hymnBooks.map(async (hymnBook) => {
        const hymnsIndex = await getHymnsIndex(hymnBook.slug);

        const paths = hymnsIndex.map(({ slug }) => ({
          params: { hymnBook: hymnBook.slug, slug },
        }));

        return paths;
      })
    )
  ).flat();

  return {
    paths: allPaths,
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps<HymnViewPageProps> = async (context) => {
  const hymnBook = z.string().parse(context.params?.hymnBook);
  const hymnSlug = z.string().parse(context.params?.slug);

  const hymnNumber = String(context.params?.slug)?.split('-')[0];

  const content = await getParsedData({
    filePath: `${hymnBook}/${hymnNumber}.json`,
    schema: hymnSchema,
  });
  const hymnsIndex = await getHymnsIndex(hymnBook);
  const hymnIndex = hymnsIndex.findIndex(({ slug }) => slug === hymnSlug);

  const hymnBooks = await getHymnBooks();

  return {
    props: {
      content,
      hymnBooks,
      hymnBook,
      previousHymn: hymnIndex > 0 ? hymnsIndex[hymnIndex - 1] : null,
      nextHymn:
        hymnIndex >= 0 && hymnIndex < hymnsIndex.length - 1 ? hymnsIndex[hymnIndex + 1] : null,
    },
  };
};

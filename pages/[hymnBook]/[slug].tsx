import { Container, Flex, Group, Space, Title } from '@mantine/core';
import { GetStaticPaths, GetStaticProps } from 'next';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { z } from 'zod';

import { useLocalStorage } from '@mantine/hooks';
import { HymnBottomNavigation } from 'components/HymnBottomNavigation';
import { HymnViewer } from 'components/HymnViewer';
import { ChordToggleButton } from 'components/HymnViewer/ChordToggleButton';
import { UpdateHymnButton } from 'components/UpdateHymnButton';
import { HC_HYMN_BOOK_SLUG, isHymnBookVisible } from 'contants';
import { normalizeHymn } from 'domain/hymn/normalizeHymn';
import { RenderableHymn } from 'domain/hymn/renderableHymn.types';
import { useGeolocationFromIp } from 'hooks/useGeolocationFromIp';
import { useChordVisibility } from 'hooks/useChordVisibility';
import { HymnsIndex } from 'schemas/hymnsIndex';
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
import { hymnDocumentSchema } from '../../schemas/hymn';
import { HymnBook } from '../../schemas/hymnBook';

type PageProps = {
  content: RenderableHymn;
  hymnBooks: HymnBook[];
  hymnBook: string;
  nextHymn: HymnsIndex[number] | null;
  previousHymn: HymnsIndex[number] | null;
};

export default function HymnView(props: AppProps & PageProps) {
  const {
    content: { editable, number, title, subtitle },
    hymnBook: hymnBookSlug,
    nextHymn,
    previousHymn,
  } = props;

  useHymnBooksSave(props.hymnBooks);
  const { canAccessHc, isLoading: isLoadingAccess } = useAccess();
  const canViewHymnBook = isHymnBookVisible(hymnBookSlug, canAccessHc);
  const [showChords, setShowChords] = useChordVisibility();
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(false);

  const router = useRouter();

  const [hymnBooks] = useHymnBooks();

  const hymnBook = hymnBooks?.find((item) => item.slug === router.query.hymnBook);

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
          hymn_number: String(number),
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
        <title>
          {number}. {title} | Hinários
        </title>
      </Head>

      <Container size="xs">
        {!autoScrollEnabled && (
          <>
            {/* <Title order={2} size="h3">
            {hymnBook?.name
          </Title> */}
            <Flex justify="space-between">
              <BackButton to={hymnBook?.slug} />

              <Group>
                {props.content.musical && (
                  <ChordToggleButton checked={showChords} onChange={setShowChords} />
                )}
                <BookmarkButton />
                {editable && <UpdateHymnButton />}
              </Group>
            </Flex>
            <Space h="md" />
          </>
        )}
        <Flex align="flex-start" gap="sm">
          <div>
            <Title order={1} size="h2">
              {number}. {title}
            </Title>
            {subtitle && (
              <Title order={5} color="dimmed" italic>
                {subtitle}
              </Title>
            )}
          </div>
        </Flex>
        <Space h="md" />
        <HymnViewer
          hymn={props.content}
          onAutoScrollEnabledChange={setAutoScrollEnabled}
          showChords={showChords}
        />

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

        {!autoScrollEnabled && (
          <HymnBottomNavigation
            currentHymnNumber={number}
            hymnBookSlug={hymnBookSlug}
            previousHymn={previousHymn}
            nextHymn={nextHymn}
          />
        )}
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

export const getStaticProps: GetStaticProps<PageProps> = async (context) => {
  const hymnBook = z.string().parse(context.params?.hymnBook);
  const hymnSlug = z.string().parse(context.params?.slug);

  const hymnNumber = String(context.params?.slug)?.split('-')[0];

  const hymnDocument = await getParsedData({
    filePath: `${hymnBook}/${hymnNumber}.json`,
    schema: hymnDocumentSchema,
  });
  const content = normalizeHymn({ hymn: hymnDocument, hymnBookSlug: hymnBook });
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

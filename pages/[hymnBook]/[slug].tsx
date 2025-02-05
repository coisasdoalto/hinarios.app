import {
  Container,
  Flex,
  Space,
  Text,
  Title,
} from '@mantine/core';
import { GetStaticPaths, GetStaticProps } from 'next';
import { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { z } from 'zod';

import { useLocalStorage } from '@mantine/hooks';
import { HymnTextWithVariations } from 'components/HymnTextWithVariations';
import { useGeolocationFromIp } from 'hooks/useGeolocationFromIp';
import { supabase } from 'supabase';
import BackButton from '../../components/BackButton/BackButton';
import { BookmarkButton } from '../../components/BookmarkButton';
import { useHymnBooks, useHymnBooksSave } from '../../context/HymnBooks';
import getHymnBooks from '../../data/getHymnBooks';
import getHymnsIndex from '../../data/getHymnsIndex';
import getParsedData from '../../data/getParsedData';
import { Hymn, hymnSchema } from '../../schemas/hymn';
import { HymnBook } from '../../schemas/hymnBook';
import HymnTextSize from '../../components/VerticalNavigation/HymnTextSize';


type PageProps = { content: Hymn; hymnBooks: HymnBook[]; hymnBook: string };

export default function HymnView(props: AppProps & PageProps) {
  const {
    content: { number, title, subtitle, lyrics },
  } = props;

  useHymnBooksSave(props.hymnBooks);


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
    if (isLoading || !geolocation) return;

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

      setVisitId(ipData.data.id);   })();

    return () => {
      (async () => {
        if (!visitId) return;
        await supabase.from('hymns_visits').delete().eq('id', visitId);
      })();
    };
  }, [isLoading]);

  return (
    <Container size="xs">
           

      <Space h="md" />
      {/* <Title order={2} size="h3">
        {hymnBook?.name
      </Title> */}
      <Flex justify="space-between">
        <BackButton to={hymnBook?.slug} />

        <BookmarkButton />
      </Flex>
      <Space h="md" />
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
    
      <HymnTextSize>
        {lyrics.map((lyric, index) => (
          <Text key={index} mt={16} pl={20}>
            <HymnTextWithVariations>{lyric.text}</HymnTextWithVariations>
          </Text>
        ))}
      </HymnTextSize>


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
    </Container>
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
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<PageProps> = async (context) => {
  const hymnBook = z.string().parse(context.params?.hymnBook);
  const hymnNumber = String(context.params?.slug)?.split('-')[0];

  const content = await getParsedData({
    filePath: `${hymnBook}/${hymnNumber}.json`,
    schema: hymnSchema,
  });

  const hymnBooks = await getHymnBooks();

  return {
    props: { content, hymnBooks, hymnBook },
  };
};

import {
  Box,
  Container,
  Flex,
  MantineSize,
  SegmentedControl,
  Space,
  Text,
  Title,
} from '@mantine/core';
import { GetStaticPaths, GetStaticProps } from 'next';
import { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { Fragment, useEffect, useState } from 'react';

import { z } from 'zod';

import { HymnTextWithVariations } from 'components/HymnTextWithVariations';
import BackButton from '../../components/BackButton/BackButton';
import { BookmarkButton } from '../../components/BookmarkButton';
import { useHymnBooks, useHymnBooksSave } from '../../context/HymnBooks';
import getHymnBooks from '../../data/getHymnBooks';
import getHymnsIndex from '../../data/getHymnsIndex';
import getParsedData from '../../data/getParsedData';
import { Hymn, hymnSchema } from '../../schemas/hymn';
import { HymnBook } from '../../schemas/hymnBook';

const validateFontSize = (fontSize: string): fontSize is MantineSize => /md|lg|xl/.test(fontSize);

type PageProps = { content: Hymn; hymnBooks: HymnBook[]; hymnBook: string };

export default function HymnView(props: AppProps & PageProps) {
  const {
    content: { number, title, subtitle, lyrics },
  } = props;

  useHymnBooksSave(props.hymnBooks);

  const [fontSize, setFontSize] = useState<MantineSize>('md');

  useEffect(() => {
    const localStorageFontSize = localStorage.getItem('fontSize') || '';

    if (validateFontSize(localStorageFontSize)) {
      setFontSize(localStorageFontSize);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('fontSize', fontSize);
  }, [fontSize]);

  const Chorus = ({ text }: { text: string }) => (
    <Text size={fontSize} mt={16} pl={40} italic>
      <HymnTextWithVariations>{text}</HymnTextWithVariations>
    </Text>
  );

  const router = useRouter();

  const [hymnBooks] = useHymnBooks();

  const hymnBook = hymnBooks?.find((item) => item.slug === router.query.hymnBook);

  return (
    <Container size="xs">
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
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <SegmentedControl
          value={fontSize}
          onChange={(value: MantineSize) => setFontSize(value)}
          data={[
            { label: 'Pequeno', value: 'md' },
            { label: 'Médio', value: 'lg' },
            { label: 'Grande', value: 'xl' },
          ]}
        />
      </Box>

      {lyrics.map((lyric, index) => {
        if (lyric.type === 'chorus') return <Chorus key={index} text={lyric.text} />;

        if (lyric.type === 'unnumbered_stanza')
          return (
            <Text key={index} size={fontSize} mt={16} pl={20} style={{ position: 'relative' }}>
              <HymnTextWithVariations>{lyric.text}</HymnTextWithVariations>
            </Text>
          );

        return (
          <Text key={lyric.number} size={fontSize} mt={16} pl={20} style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 0 }}>{lyric.number}.</span>
            <HymnTextWithVariations>{lyric.text}</HymnTextWithVariations>
          </Text>
        );
      })}

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

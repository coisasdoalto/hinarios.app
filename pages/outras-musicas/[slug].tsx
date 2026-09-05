import { GetStaticPaths, GetStaticProps } from 'next';
import { z } from 'zod';

import HymnView, { HymnViewPageProps } from '../[hymnBook]/[slug]';
import { OTHER_SONGS_SLUG } from '../../contants';
import getHymnBooks from '../../data/getHymnBooks';
import getOtherSong from '../../data/getOtherSong';
import getOtherSongsIndex from '../../data/getOtherSongsIndex';

export default HymnView;

export const getStaticPaths: GetStaticPaths = async () => {
  const songs = await getOtherSongsIndex();

  return {
    paths: songs.map(({ slug }) => ({ params: { slug } })),
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps<HymnViewPageProps> = async (context) => {
  const slug = z.string().parse(context.params?.slug);
  const [song, songs, hymnBooks] = await Promise.all([
    getOtherSong(slug),
    getOtherSongsIndex(),
    getHymnBooks(),
  ]);

  if (!song) return { notFound: true };

  const songIndex = songs.findIndex((item) => item.slug === song.indexItem.slug);
  const toNavigationItem = (item: typeof songs[number]) => ({
    title: item.title,
    ...(item.subtitle ? { subtitle: item.subtitle } : {}),
    slug: item.slug,
  });

  return {
    props: {
      content: song.content,
      hymnBooks,
      hymnBook: OTHER_SONGS_SLUG,
      backPath: OTHER_SONGS_SLUG,
      routeBase: OTHER_SONGS_SLUG,
      showSongNumber: false,
      allowEditing: false,
      previousHymn: songIndex > 0 ? toNavigationItem(songs[songIndex - 1]) : null,
      nextHymn:
        songIndex >= 0 && songIndex < songs.length - 1
          ? toNavigationItem(songs[songIndex + 1])
          : null,
    },
  };
};

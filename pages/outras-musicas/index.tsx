import { GetStaticProps } from 'next';
import Head from 'next/head';

import HymnsList from '../../components/HymnsList/HymnsList';
import { OTHER_SONGS_NAME, OTHER_SONGS_SLUG } from '../../contants';
import { useHymnBooksSave } from '../../context/HymnBooks';
import getHymnBooks from '../../data/getHymnBooks';
import getOtherSongsIndex from '../../data/getOtherSongsIndex';
import { HymnBook } from '../../schemas/hymnBook';
import { OtherSongsIndex } from '../../schemas/otherSongsIndex';

type PageProps = {
  songs: OtherSongsIndex;
  hymnBooks: HymnBook[];
};

export default function OtherSongs({ songs, hymnBooks }: PageProps) {
  useHymnBooksSave(hymnBooks);

  const collection = {
    slug: OTHER_SONGS_SLUG,
    name: OTHER_SONGS_NAME,
    index: songs,
  };

  return (
    <>
      <Head>
        <title>{OTHER_SONGS_NAME} | Hinários</title>
      </Head>

      <HymnsList hymnsIndex={songs} hymnBook={collection} showNumbers={false} />
    </>
  );
}

export const getStaticProps: GetStaticProps<PageProps> = async () => {
  const [songs, hymnBooks] = await Promise.all([getOtherSongsIndex(), getHymnBooks()]);

  return { props: { songs, hymnBooks } };
};

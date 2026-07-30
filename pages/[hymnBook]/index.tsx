import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { z } from 'zod';
import { HC_HYMN_BOOK_SLUG, isHymnBookVisible } from 'contants';
import { AccessLoading } from '../../components/AccessLoading';
import { HymnBookUnavailable } from '../../components/HymnBookUnavailable';
import HymnsList from '../../components/HymnsList/HymnsList';
import { useHymnBooksSave } from '../../context/HymnBooks';
import getHymnBookInfo from '../../data/getHymnBookInfo';
import getHymnBooks from '../../data/getHymnBooks';
import getHymnsIndex from '../../data/getHymnsIndex';
import { useAccess } from '../../hooks/useAccess';
import { HymnBook } from '../../schemas/hymnBook';
import { HymnsIndex } from '../../schemas/hymnsIndex';

type PageProps = {
  hymnsIndex: HymnsIndex;
  hymnBook: HymnBook;
  hymnBooks: HymnBook[];
};

export default function Home({ hymnsIndex, hymnBook, hymnBooks }: PageProps) {
  useHymnBooksSave(hymnBooks);
  const { canAccessHc, isLoading } = useAccess();

  if (hymnBook.slug === HC_HYMN_BOOK_SLUG && isLoading) {
    return <AccessLoading />;
  }

  if (!isHymnBookVisible(hymnBook.slug, canAccessHc)) {
    return <HymnBookUnavailable />;
  }

  return (
    <>
      <Head>
        <title>{`${hymnBook.name} | Hinários`}</title>
      </Head>

      <HymnsList hymnsIndex={hymnsIndex} hymnBook={hymnBook} />
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const hymnBooks = await getHymnBooks();

  const paths = hymnBooks.map((hymnBook) => ({
    params: { hymnBook: hymnBook.slug },
  }));

  return {
    paths,
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps<PageProps> = async (context) => {
  const hymnBookSlug = z.string().parse(context.params?.hymnBook);

  const hymnsIndex = await getHymnsIndex(hymnBookSlug);

  const hymnBookInfo = await getHymnBookInfo(hymnBookSlug);

  const hymnBooks = await getHymnBooks();

  return {
    props: {
      hymnsIndex,
      hymnBook: {
        ...hymnBookInfo,
        slug: hymnBookSlug,
        index: hymnsIndex,
      },
      hymnBooks,
    },
  };
};

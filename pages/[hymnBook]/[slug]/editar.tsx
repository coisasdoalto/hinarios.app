import { GetStaticPaths, GetStaticProps } from 'next';
import { AppProps } from 'next/app';
import { useRouter } from 'next/router';

import { AdminHymnEditor } from 'components/HymnEditor';
import { useHymnBooksSave } from 'context/HymnBooks';
import getHymnBooks from 'data/getHymnBooks';
import getHymnsIndex from 'data/getHymnsIndex';
import { HymnBook } from 'schemas/hymnBook';

type PageProps = { hymnBooks: HymnBook[] };

export default function Page(props: AppProps & PageProps) {
  useHymnBooksSave(props.hymnBooks);

  const router = useRouter();
  if (!router.isReady) return null;

  return (
    <AdminHymnEditor
      hymnBookSlug={String(router.query.hymnBook ?? '')}
      hymnSlug={String(router.query.slug ?? '')}
    />
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const hymnBooks = await getHymnBooks({ withIndex: false });

  const paths = (
    await Promise.all(
      hymnBooks.map(async (hymnBook) => {
        const index = await getHymnsIndex(hymnBook.slug);

        return index.map(({ slug }) => ({ params: { hymnBook: hymnBook.slug, slug } }));
      })
    )
  ).flat();

  return { paths, fallback: false };
};

export const getStaticProps: GetStaticProps<PageProps> = async () => {
  // Only slug and name: an undefined `index` cannot be serialized as a page prop.
  const hymnBooks = (await getHymnBooks({ withIndex: false })).map(({ slug, name }) => ({
    slug,
    name,
  }));

  return { props: { hymnBooks } };
};

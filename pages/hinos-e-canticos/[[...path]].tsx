import { Container, Text } from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';

import { AccessLoading } from '../../components/AccessLoading';
import HymnsList from '../../components/HymnsList/HymnsList';
import { HymnBookUnavailable } from '../../components/HymnBookUnavailable';
import { HC_HYMN_BOOK_SLUG, isHymnBookVisible } from '../../contants';
import { useAccess } from '../../hooks/useAccess';
import { hcGet } from '../../utils/hcRequest';
import { HymnsIndex } from '../../schemas/hymnsIndex';
import HymnView, { HymnViewPageProps } from '../[hymnBook]/[slug]';

type HcIndexResponse = { hymnBook: { name: string }; index: HymnsIndex };
type HymnNavigation = NonNullable<HymnViewPageProps['nextHymn']>;

/**
 * The HC book is protected: its pages are a static shell, and the content comes from
 * `/api/hc/*` after the server confirms access. Cloudflare rewrites every `/hinos-e-canticos/*`
 * request to this shell, and the router reads the hymn slug on the client.
 */
export default function HinosECanticosPage() {
  const router = useRouter();
  const { canAccessHc, isLoading: isLoadingAccess } = useAccess();
  const canView = isHymnBookVisible(HC_HYMN_BOOK_SLUG, canAccessHc);
  const hymnSlug = Array.isArray(router.query.path) ? router.query.path[0] : undefined;
  const isEnabled = router.isReady && canView;

  const index = useQuery({
    queryKey: ['hc_index'],
    queryFn: async () => (await hcGet<HcIndexResponse>('/api/hc/book')).data,
    enabled: isEnabled,
    staleTime: Infinity,
  });

  const hymn = useQuery({
    queryKey: ['hc_hymn', hymnSlug],
    queryFn: async () =>
      (
        await hcGet<HymnViewPageProps['content']>(
          `/api/hc/hymns/${encodeURIComponent(hymnSlug ?? '')}`
        )
      ).data,
    enabled: isEnabled && Boolean(hymnSlug),
    staleTime: Infinity,
  });

  if (!router.isReady || isLoadingAccess) return <AccessLoading />;
  if (!canView) return <HymnBookUnavailable />;
  if (!index.data) return <AccessLoading />;

  const hymnsIndex = index.data.index;

  if (!hymnSlug) {
    return (
      <>
        <Head>
          <title>Hinos e Cânticos | Hinários</title>
        </Head>
        <HymnsList
          hymnsIndex={hymnsIndex}
          hymnBook={{ name: index.data.hymnBook.name, slug: HC_HYMN_BOOK_SLUG }}
        />
      </>
    );
  }

  if (hymn.isError) {
    return (
      <Container size="xs">
        <Text>Hino não encontrado.</Text>
      </Container>
    );
  }

  if (!hymn.data) return <AccessLoading />;

  const position = hymnsIndex.findIndex(({ slug }) => slug === hymnSlug);
  const toNavigation = (item: HymnsIndex[number]): HymnNavigation => ({
    title: item.title,
    ...(item.subtitle ? { subtitle: item.subtitle } : {}),
    slug: item.slug,
  });

  return (
    <HymnView
      content={hymn.data}
      hymnBook={HC_HYMN_BOOK_SLUG}
      backPath={HC_HYMN_BOOK_SLUG}
      routeBase={HC_HYMN_BOOK_SLUG}
      previousHymn={position > 0 ? toNavigation(hymnsIndex[position - 1]) : null}
      nextHymn={
        position >= 0 && position < hymnsIndex.length - 1
          ? toNavigation(hymnsIndex[position + 1])
          : null
      }
    />
  );
}

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: [{ params: { path: [] } }],
  fallback: false,
});

export const getStaticProps: GetStaticProps = async () => ({ props: {} });

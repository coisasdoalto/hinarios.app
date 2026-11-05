import { SpotlightAction } from '@mantine/spotlight';
import { Document } from 'flexsearch';
import { NextRouter } from 'next/router';
import { isHymnBookVisible, OTHER_SONGS_SLUG } from 'contants';
import { highlightMatches } from './highlightMatches';

function docCheck(
  doc: unknown
): doc is { title: string; body: string; slug: string; hymnBookName: string } {
  if (doc) {
    return true;
  }
  return false;
}

export function performTextualSearch({
  searchIndex,
  query,
  router,
  canAccessHc,
  canAccessOtherSongs,
}: {
  searchIndex: Document;
  query: string;
  router: NextRouter;
  canAccessHc: boolean;
  canAccessOtherSongs: boolean;
}) {
  const searchResultsByIndex = searchIndex.search(query, {
    index: ['body', 'title'],
    limit: 10,
    suggest: true,
    enrich: true,
  });

  if (!Array.isArray(searchResultsByIndex)) {
    return;
  }

  const filteredData: SpotlightAction[] = searchResultsByIndex
    .flatMap((searchResultByIndex) => {
      const hasResult = 'result' in searchResultByIndex;

      if (!hasResult) {
        return null;
      }

      return searchResultByIndex.result.map((result) => {
        if (typeof result === 'string' || typeof result === 'number') {
          return null;
        }

        const collectionSlug = String(result.id).split('/')[0];

        if (
          !isHymnBookVisible(collectionSlug, canAccessHc) ||
          (collectionSlug === OTHER_SONGS_SLUG && !canAccessOtherSongs)
        ) {
          return null;
        }

        const doc = result.doc;

        if (!docCheck(doc)) {
          return null;
        }

        // flexsearch's own highlighting doesn't work well with long queries: it uses
        // the index's forward tokenization, so short words like "a" or "os" get
        // highlighted inside other words. We build the highlight ourselves instead,
        // looking for the query as a sequence of whole words.
        // When no word matches (e.g. results from `suggest`), show the body as is.
        const isTitle = searchResultByIndex.field === 'title';
        const description =
          highlightMatches(isTitle ? doc.title : doc.body, query) ??
          (isTitle ? undefined : doc.body);

        const action = {
          id: `${doc.hymnBookName}${doc.title}`,
          title: doc.title,
          description,
          onTrigger: () => router.push(`/${result.id}`),
          group: doc.hymnBookName,
          type: searchResultByIndex.field,
        };

        return action;
      });
    })
    .reduce<SpotlightAction[]>((final, item, _, original) => {
      if (!item || final.find((item2) => item2?.id === item?.id)) {
        return final;
      }

      if (item.type === 'body') {
        return [...final, item];
      }

      const found = original.filter((item2) => item2?.id === item?.id);

      if (found?.length > 1) {
        const itemWithDescription = found.find((item2) => item2?.description);

        return [...final, itemWithDescription ?? item];
      }

      return [...final, item];
    }, []);

  return filteredData;
}

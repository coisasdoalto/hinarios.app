import { SpotlightAction } from '@mantine/spotlight';
import { Document } from 'flexsearch';

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
}: {
  searchIndex: Document;
  query: string;
  router: NextRouter;
}) {
  const searchResultsByIndex = searchIndex.search(query, {
    index: ['body', 'title'],
    limit: 10,
    suggest: true,
    enrich: true,
    highlight: '@@@$1@@@',
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

        const doc = result.doc;

        if (!docCheck(doc)) {
          return null;
        }

        // Gets 3 words before the first highlight (@@@term@@@), and the rest of the string
        // Sometimes, for some reason, flexsearch doesn't properly highlight the search term
        // and returns the whole body as the highlight.
        // In this case the match won't be found, so I just use the whole highlight/body.
        const description =
          result.highlight?.match(/(?:\S+\s+){0,3}@@@.+@@@.*/)?.[0] ?? result.highlight;

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
    .reduce<SpotlightAction[]>((final, item, index, original) => {
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


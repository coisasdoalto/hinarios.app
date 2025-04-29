import { SpotlightAction } from '@mantine/spotlight';
import { HymnBooksState } from 'context/HymnBooks';
import { NextRouter } from 'next/router';

export function performNumericSearch({
  hymnBooks,
  queryAsNumber,
  router,
}: {
  hymnBooks?: HymnBooksState;
  queryAsNumber: number;
  router: NextRouter;
}) {
  return hymnBooks
    ?.flatMap((hymnBook) => {
      const actions = hymnBook.index
        ?.filter((hymn) => parseInt(String(hymn.number), 10) === queryAsNumber)
        .map((hymn) => {
          const action: SpotlightAction = {
            id: hymn.slug,
            title: `${hymn.number}. ${hymn.title}`,
            description: `@@@${hymn.number}@@@. ${hymn.title}`,
            onTrigger: () => router.push(`/${hymnBook.slug}/${hymn.slug}`),
            group: hymnBook.name,
          };

          return action;
        });

      return actions;
    })
    .filter((item): item is SpotlightAction => {
      return Boolean(item);
    });
}

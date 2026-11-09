import { useQuery } from '@tanstack/react-query';
import { HC_HYMN_BOOK_SLUG, HYMN_BOOKS_ORDER, isHymnBookVisible } from 'contants';
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react';
import { useAccess } from '../hooks/useAccess';
import { HymnBook } from '../schemas/hymnBook';
import { hcGet } from '../utils/hcRequest';

type HcBookResponse = { hymnBook: { name: string }; index: HymnBook['index'] };

/**
 * Loads the HC book only for users that the server allows to see it.
 * @example const { data } = useHcBook(canAccessHc);
 */
const useHcBook = (enabled: boolean) =>
  useQuery({
    queryKey: ['hc_book'],
    queryFn: async (): Promise<HymnBook> => {
      const { data } = await hcGet<HcBookResponse>('/api/hc/book');

      return { slug: HC_HYMN_BOOK_SLUG, name: data.hymnBook.name, index: data.index };
    },
    enabled,
    staleTime: Infinity,
  });

export type HymnBooksState = HymnBook[] | null;

export const HymnBooksContext = createContext<
  [HymnBooksState, Dispatch<SetStateAction<HymnBooksState>>] | [undefined, Function]
>([undefined, () => {}]);

export const useCreateHymnBooksCache = () => useState<HymnBooksState>(null);

function orderHymnBooks(hymnBooks: HymnBook[] | null, canAccessHc: boolean) {
  if (!hymnBooks) return null;

  return hymnBooks
    .filter(({ slug }) => isHymnBookVisible(slug, canAccessHc))
    .sort((a, b) => {
      const firstItemIndex = HYMN_BOOKS_ORDER.indexOf(a.slug);
      const secondItemIndex = HYMN_BOOKS_ORDER.indexOf(b.slug);

      if (firstItemIndex === -1) return 1;
      if (secondItemIndex === -1) return -1;
      if (firstItemIndex !== secondItemIndex) return firstItemIndex - secondItemIndex;

      return a.name.localeCompare(b.name);
    });
}

export const HymnBooksProvider = ({
  children,
  hymnBooksCache,
}: PropsWithChildren<{ hymnBooksCache: ReturnType<typeof useCreateHymnBooksCache> }>) => {
  const [publicHymnBooks, setHymnBooks] = hymnBooksCache;
  const { canAccessHc } = useAccess();
  const { data: hcBook } = useHcBook(canAccessHc);

  // Public pages only ship the visible books, so the HC book joins the list when access allows it.
  const hymnBooks =
    publicHymnBooks && hcBook
      ? [...publicHymnBooks.filter(({ slug }) => slug !== HC_HYMN_BOOK_SLUG), hcBook]
      : publicHymnBooks;

  const orderedHymnBooks = orderHymnBooks(hymnBooks, canAccessHc);

  return (
    <HymnBooksContext.Provider value={[orderedHymnBooks, setHymnBooks]}>
      {children}
    </HymnBooksContext.Provider>
  );
};

export const useHymnBooks = () => useContext(HymnBooksContext);

export const useHymnBooksSave = (hymnBooks?: HymnBook[]) => {
  const [, setHymnBooks] = useHymnBooks();

  useEffect(() => {
    if (hymnBooks) setHymnBooks(hymnBooks);
  }, []);
};

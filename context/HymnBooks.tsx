import { HYMN_BOOKS_ORDER, isHymnBookVisible } from 'contants';
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
  const [hymnBooks, setHymnBooks] = hymnBooksCache;
  const { canAccessHc } = useAccess();

  const orderedHymnBooks = orderHymnBooks(hymnBooks, canAccessHc);

  return (
    <HymnBooksContext.Provider value={[orderedHymnBooks, setHymnBooks]}>
      {children}
    </HymnBooksContext.Provider>
  );
};

export const useHymnBooks = () => useContext(HymnBooksContext);

export const useHymnBooksSave = (hymnBooks: HymnBook[]) => {
  const [, setHymnBooks] = useHymnBooks();

  useEffect(() => {
    setHymnBooks(hymnBooks);
  }, []);
};

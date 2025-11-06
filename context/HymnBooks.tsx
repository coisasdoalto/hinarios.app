import { HYMN_BOOKS_ORDER } from 'contants';
import {
  createContext,
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react';
import { HymnBook } from '../schemas/hymnBook';

export type HymnBooksState = HymnBook[] | null;

export const HymnBooksContext = createContext<
  [HymnBooksState, Dispatch<SetStateAction<HymnBooksState>>] | [undefined, Function]
>([undefined, () => {}]);

export const useCreateHymnBooksCache = () => useState<HymnBooksState>(null);

function orderHymnBooks(hymnBooks: HymnBook[] | null) {
  if (!hymnBooks) return null;

  return hymnBooks.sort((a, b) => {
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

  const orderedHymnBooks = orderHymnBooks(hymnBooks);

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

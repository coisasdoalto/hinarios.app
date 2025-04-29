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

export const HymnBooksProvider = ({
  children,
  hymnBooksCache,
}: PropsWithChildren<{ hymnBooksCache: ReturnType<typeof useCreateHymnBooksCache> }>) => (
  <HymnBooksContext.Provider value={hymnBooksCache}>{children}</HymnBooksContext.Provider>
);

export const useHymnBooks = () => useContext(HymnBooksContext);

export const useHymnBooksSave = (hymnBooks: HymnBook[]) => {
  const [, setHymnBooks] = useHymnBooks();

  useEffect(() => {
    setHymnBooks(hymnBooks);
  }, []);
};

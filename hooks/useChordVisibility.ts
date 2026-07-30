import { useLocalStorage } from '@mantine/hooks';

const CHORD_VISIBILITY_STORAGE_KEY = 'chordSheet.showChords';

type SetChordVisibility = (value: boolean | ((current: boolean) => boolean)) => void;

/**
 * Shares the persisted chord visibility preference across the hymn page.
 *
 * @example const [showChords, setShowChords] = useChordVisibility()
 */
export function useChordVisibility(): [boolean, SetChordVisibility] {
  const [showChords, setShowChords] = useLocalStorage<boolean>({
    defaultValue: false,
    key: CHORD_VISIBILITY_STORAGE_KEY,
  });

  return [showChords, setShowChords];
}

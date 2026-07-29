import { useLocalStorage } from '@mantine/hooks';

export const CHORD_VARIATIONS_STORAGE_KEY = 'chordSheet.selectedVariations';

export type SelectedChordVariations = Record<string, number>;
export type SetSelectedChordVariations = (value: SelectedChordVariations) => void;

/**
 * Shares persisted chord-position preferences across diagram presentations.
 *
 * @example const [variations, setVariations] = useStoredChordVariations()
 */
export function useStoredChordVariations(): [SelectedChordVariations, SetSelectedChordVariations] {
  const [selectedVariations, setSelectedVariations] = useLocalStorage<SelectedChordVariations>({
    defaultValue: {},
    key: CHORD_VARIATIONS_STORAGE_KEY,
  });
  return [selectedVariations, setSelectedVariations];
}

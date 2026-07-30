import { useLocalStorage } from '@mantine/hooks';

const CHORD_DIAGRAM_VISIBILITY_STORAGE_KEY = 'chordSheet.showChordDiagrams';

type SetChordDiagramVisibility = (value: boolean | ((current: boolean) => boolean)) => void;

export function useChordDiagramVisibility(): [boolean, SetChordDiagramVisibility] {
  const [showChordDiagrams, setShowChordDiagrams] = useLocalStorage<boolean>({
    defaultValue: true,
    key: CHORD_DIAGRAM_VISIBILITY_STORAGE_KEY,
  });

  return [showChordDiagrams, setShowChordDiagrams];
}

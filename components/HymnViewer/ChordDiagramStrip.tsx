import { Box, Group, useMantineTheme } from '@mantine/core';
import { ReactElement, ReactNode, useEffect, useMemo, useRef } from 'react';
import { ChordDiagramRenderer } from '../../chord-diagrams/chordDiagram.types';
import { extractUniqueChordSymbols } from '../../chord-sheets/extractChords';
import { RenderableHymn } from '../../domain/hymn/renderableHymn.types';
import { ChordDiagram } from './ChordDiagram';
import {
  SelectedChordVariations,
  SetSelectedChordVariations,
  useStoredChordVariations,
} from './useStoredChordVariations';

type ChordDiagramStripProps = {
  hymn: RenderableHymn;
  renderer?: ChordDiagramRenderer;
  transpose: number;
};

function resetVisibleVariations(symbols: string[]): SelectedChordVariations {
  return Object.fromEntries(symbols.map((symbol) => [symbol, 0]));
}

function useSelectedChordVariations(
  symbols: string[],
  transpose: number
): [SelectedChordVariations, SetSelectedChordVariations] {
  const previousTranspose = useRef(transpose);
  const [selectedVariations, setSelectedVariations] = useStoredChordVariations();

  useEffect(() => {
    if (previousTranspose.current === transpose) return;
    previousTranspose.current = transpose;
    setSelectedVariations({ ...selectedVariations, ...resetVisibleVariations(symbols) });
  }, [selectedVariations, setSelectedVariations, symbols, transpose]);

  return [selectedVariations, setSelectedVariations];
}

function StickyDiagramContainer({ children }: { children: ReactNode }): ReactElement {
  const theme = useMantineTheme();
  const backgroundColor =
    theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0];
  const borderColor = theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[3];

  return (
    <Box
      aria-label="Diagramas dos acordes"
      mt="md"
      py="xs"
      role="region"
      sx={{
        backgroundColor,
        borderBottom: `1px solid ${borderColor}`,
        borderTop: `1px solid ${borderColor}`,
        overflowX: 'auto',
        position: 'sticky',
        top: 50,
        zIndex: 10,
        [theme.fn.largerThan('md')]: { top: 70 },
      }}
    >
      {children}
    </Box>
  );
}

function DiagramList({
  renderer,
  selectedVariations,
  setSelectedVariations,
  symbols,
}: Pick<ChordDiagramStripProps, 'renderer'> & {
  selectedVariations: SelectedChordVariations;
  setSelectedVariations: SetSelectedChordVariations;
  symbols: string[];
}): ReactElement {
  return (
    <Group align="flex-start" noWrap spacing="md">
      {symbols.map((symbol) => (
        <ChordDiagram
          key={symbol}
          onVariationChange={(variationIndex) =>
            setSelectedVariations({ ...selectedVariations, [symbol]: variationIndex })
          }
          renderer={renderer}
          symbol={symbol}
          variationIndex={selectedVariations[symbol] ?? 0}
        />
      ))}
    </Group>
  );
}

/**
 * Keeps the current hymn's chord diagrams visible while its lyrics scroll.
 *
 * @example <ChordDiagramStrip hymn={hymn} transpose={0} />
 */
export function ChordDiagramStrip({
  hymn,
  renderer,
  transpose,
}: ChordDiagramStripProps): ReactElement | null {
  const symbols = useMemo(() => extractUniqueChordSymbols(hymn, transpose), [hymn, transpose]);
  const [selectedVariations, setSelectedVariations] = useSelectedChordVariations(
    symbols,
    transpose
  );
  if (symbols.length === 0) return null;

  return (
    <StickyDiagramContainer>
      <DiagramList
        renderer={renderer}
        selectedVariations={selectedVariations}
        setSelectedVariations={setSelectedVariations}
        symbols={symbols}
      />
    </StickyDiagramContainer>
  );
}

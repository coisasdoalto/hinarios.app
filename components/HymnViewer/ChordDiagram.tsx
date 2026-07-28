import { ActionIcon, Box, Group, Text } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import { ReactElement, useEffect, useRef } from 'react';
import { guitarChordDictionary } from '../../chord-diagrams/chordDictionary';
import { ChordDiagramRenderer, GuitarChordPosition } from '../../chord-diagrams/chordDiagram.types';
import { svguitarDiagramRenderer } from '../../chord-diagrams/svguitarRenderer';

type ChordDiagramProps = {
  onVariationChange: (variationIndex: number) => void;
  renderer?: ChordDiagramRenderer;
  symbol: string;
  variationIndex: number;
};

type SupportedChordDiagramProps = Pick<ChordDiagramProps, 'onVariationChange' | 'symbol'> & {
  positions: GuitarChordPosition[];
  renderer: ChordDiagramRenderer;
  selectedIndex: number;
};

function VariationButton({
  direction,
  disabled,
  onClick,
}: {
  direction: 'anterior' | 'próxima';
  disabled: boolean;
  onClick: () => void;
}): ReactElement {
  const Icon = direction === 'anterior' ? IconChevronLeft : IconChevronRight;

  return (
    <ActionIcon
      aria-label={`Mostrar ${direction} posição do acorde`}
      disabled={disabled}
      onClick={onClick}
      size="sm"
      variant="subtle"
    >
      <Icon size={16} />
    </ActionIcon>
  );
}

function DiagramCanvas({
  position,
  renderer,
  symbol,
}: {
  position: GuitarChordPosition;
  renderer: ChordDiagramRenderer;
  symbol: string;
}): ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) renderer.draw(containerRef.current, symbol, position);
  }, [position, renderer, symbol]);

  return (
    <Box
      ref={containerRef}
      sx={{ '& svg': { display: 'block', height: 'auto', margin: '0 auto', width: 110 } }}
    />
  );
}

function UnavailableChordDiagram({ symbol }: { symbol: string }): ReactElement {
  return (
    <Box miw={120}>
      <Text align="center" weight={600}>
        {symbol}
      </Text>
      <Text align="center" color="dimmed" size="xs">
        Diagrama indisponível
      </Text>
    </Box>
  );
}

function VariationControls({
  count,
  onVariationChange,
  selectedIndex,
}: {
  count: number;
  onVariationChange: (variationIndex: number) => void;
  selectedIndex: number;
}): ReactElement {
  const hasMultiplePositions = count > 1;

  return (
    <Group position="center" spacing={2} noWrap>
      <VariationButton
        direction="anterior"
        disabled={!hasMultiplePositions}
        onClick={() => onVariationChange((selectedIndex - 1 + count) % count)}
      />
      <Text size="xs">
        {selectedIndex + 1}/{count}
      </Text>
      <VariationButton
        direction="próxima"
        disabled={!hasMultiplePositions}
        onClick={() => onVariationChange((selectedIndex + 1) % count)}
      />
    </Group>
  );
}

function SupportedChordDiagram({
  onVariationChange,
  positions,
  renderer,
  selectedIndex,
  symbol,
}: SupportedChordDiagramProps): ReactElement {
  return (
    <Box miw={120}>
      <DiagramCanvas position={positions[selectedIndex]} renderer={renderer} symbol={symbol} />
      <VariationControls
        count={positions.length}
        onVariationChange={onVariationChange}
        selectedIndex={selectedIndex}
      />
    </Box>
  );
}

/**
 * Renders one chord and lets the musician choose among its guitar positions.
 *
 * @example <ChordDiagram symbol="G" variationIndex={0} onVariationChange={selectVariation} />
 */
export function ChordDiagram({
  onVariationChange,
  renderer = svguitarDiagramRenderer,
  symbol,
  variationIndex,
}: ChordDiagramProps): ReactElement {
  const positions = guitarChordDictionary.findGuitarVariations(symbol)?.positions;
  if (!positions?.length) return <UnavailableChordDiagram symbol={symbol} />;

  const selectedIndex = Math.min(variationIndex, positions.length - 1);
  return (
    <SupportedChordDiagram
      onVariationChange={onVariationChange}
      positions={positions}
      renderer={renderer}
      selectedIndex={selectedIndex}
      symbol={symbol}
    />
  );
}

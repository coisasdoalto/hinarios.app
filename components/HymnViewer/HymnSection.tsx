import { Box, MantineSize, Text } from '@mantine/core';
import { Fragment, ReactElement, ReactNode } from 'react';
import { ChordDiagramRenderer } from '../../chord-diagrams/chordDiagram.types';
import {
  FormattedChordToken,
  formatPositionedChordTokens,
} from '../../chord-sheets/transposeChordSheet';
import {
  PositionedChord,
  RenderableLine,
  RenderableSection,
  RenderableTextSegment,
} from '../../domain/hymn/renderableHymn.types';
import { HymnTextWithVariations } from '../HymnTextWithVariations';
import { InlineChordDiagram } from './InlineChordDiagram';
import {
  SelectedChordVariations,
  SetSelectedChordVariations,
  useStoredChordVariations,
} from './useStoredChordVariations';

type HymnSectionProps = {
  diagramRenderer?: ChordDiagramRenderer;
  fontSize: MantineSize;
  isMusical: boolean;
  section: RenderableSection;
  showChords: boolean;
  transpose: number;
};

type ChordVariationProps = {
  diagramRenderer?: ChordDiagramRenderer;
  selectedVariations: SelectedChordVariations;
  setSelectedVariations: SetSelectedChordVariations;
};

function findRepeatTimes(section: RenderableSection, lineId: string): number | undefined {
  return section.repeats?.find(({ lineIds }) => lineIds.at(-1) === lineId)?.times;
}

type ChordSheetLineProps = ChordVariationProps & {
  line: RenderableLine;
  repeatTimes?: number;
  showChords: boolean;
  transpose: number;
};

function FormattedLyricsSegment({ segment }: { segment: RenderableTextSegment }): ReactElement {
  let formattedText: ReactNode = segment.text;
  if (segment.italic) formattedText = <em>{formattedText}</em>;
  if (segment.bold) formattedText = <strong>{formattedText}</strong>;
  return <>{formattedText}</>;
}

function FormattedLyrics({ line }: { line: RenderableLine }): ReactElement {
  if (!line.segments) return <>{line.text}</>;

  return (
    <>
      {line.segments.map((segment, segmentIndex) => (
        <FormattedLyricsSegment key={`${line.id}/segment-${segmentIndex}`} segment={segment} />
      ))}
    </>
  );
}

type PositionedChordsProps = ChordVariationProps & {
  chords: PositionedChord[];
  transpose: number;
};

type PositionedChordTokenProps = ChordVariationProps & FormattedChordToken;

function PositionedChordToken(props: PositionedChordTokenProps): ReactElement {
  return (
    <Fragment>
      {props.leadingSpaces}
      <InlineChordDiagram
        onVariationChange={(variationIndex) =>
          props.setSelectedVariations({
            ...props.selectedVariations,
            [props.symbol]: variationIndex,
          })
        }
        renderer={props.diagramRenderer}
        symbol={props.symbol}
        variationIndex={props.selectedVariations[props.symbol] ?? 0}
      />
    </Fragment>
  );
}

function PositionedChords(props: PositionedChordsProps): ReactElement {
  const chordTokens = formatPositionedChordTokens(props.chords, props.transpose);
  return (
    <Text color="blue" inherit sx={{ fontFamily: 'monospace', whiteSpace: 'pre' }}>
      {chordTokens.map((token, chordIndex) => (
        <PositionedChordToken key={`${token.symbol}-${chordIndex}`} {...props} {...token} />
      ))}
    </Text>
  );
}

function ChordSheetLine(props: ChordSheetLineProps): ReactElement {
  const { line, repeatTimes, showChords } = props;
  const repeatLabel = repeatTimes ? ` (${repeatTimes}x)` : '';

  return (
    <Box mb={showChords && line.chords?.length ? 6 : 0}>
      {showChords && line.chords && <PositionedChords {...props} chords={line.chords} />}
      <Text
        inherit
        sx={{
          fontFamily: showChords ? 'monospace' : 'inherit',
          whiteSpace: showChords ? 'pre' : 'pre-wrap',
        }}
      >
        <FormattedLyrics line={line} />
        {repeatLabel}
      </Text>
    </Box>
  );
}

function MusicalSectionLabel({ label }: { label?: string }): ReactElement | null {
  if (!label) return null;

  return (
    <Text color="dimmed" mb={4} size="sm" weight={600}>
      [{label}]
    </Text>
  );
}

type MusicalSectionLinesProps = HymnSectionProps & ChordVariationProps;

function MusicalSectionLines(props: MusicalSectionLinesProps): ReactElement {
  return (
    <Text component="div" size={props.fontSize} sx={{ minWidth: 0 }}>
      {props.section.lines.map((line) => (
        <ChordSheetLine
          key={line.id}
          line={line}
          repeatTimes={findRepeatTimes(props.section, line.id)}
          {...props}
        />
      ))}
    </Text>
  );
}

function MusicalSection(props: HymnSectionProps): ReactElement {
  const [selectedVariations, setSelectedVariations] = useStoredChordVariations();

  return (
    <Box mt={16} sx={{ overflowX: props.showChords ? 'auto' : 'visible' }}>
      <MusicalSectionLabel label={props.section.label} />
      <MusicalSectionLines
        {...props}
        selectedVariations={selectedVariations}
        setSelectedVariations={setSelectedVariations}
      />
    </Box>
  );
}

function LegacyLines({ lines }: Pick<RenderableSection, 'lines'>): ReactElement {
  return (
    <>
      {lines.map((line, lineIndex) => (
        <span key={line.id}>
          {lineIndex > 0 && <br />}
          <HymnTextWithVariations>{line.text}</HymnTextWithVariations>
        </span>
      ))}
    </>
  );
}

function LegacySection({ fontSize, section }: HymnSectionProps): ReactElement {
  const chorusIndent = section.type === 'chorus' ? 40 : 20;

  return (
    <Text
      italic={section.type === 'chorus'}
      mt={16}
      pl={chorusIndent}
      size={fontSize}
      sx={{ position: 'relative' }}
    >
      {section.type === 'stanza' && (
        <span style={{ left: 0, position: 'absolute' }}>{section.number}.</span>
      )}
      <LegacyLines lines={section.lines} />
    </Text>
  );
}

/**
 * Renders one normalized section for either legacy lyrics or a chord sheet.
 *
 * @example <HymnSection section={section} fontSize="md" isMusical={false} />
 */
export function HymnSection(props: HymnSectionProps): ReactElement {
  if (props.isMusical) {
    return <MusicalSection {...props} />;
  }

  return <LegacySection {...props} />;
}

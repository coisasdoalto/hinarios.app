import { Box, MantineSize, Text } from '@mantine/core';
import { ReactElement, ReactNode } from 'react';
import { formatPositionedChords } from '../../chord-sheets/transposeChordSheet';
import {
  RenderableLine,
  RenderableSection,
  RenderableTextSegment,
} from '../../domain/hymn/renderableHymn.types';
import { HymnTextWithVariations } from '../HymnTextWithVariations';

type HymnSectionProps = {
  fontSize: MantineSize;
  isMusical: boolean;
  section: RenderableSection;
  showChords: boolean;
  transpose: number;
};

function findRepeatTimes(section: RenderableSection, lineId: string): number | undefined {
  return section.repeats?.find(({ lineIds }) => lineIds.at(-1) === lineId)?.times;
}

type ChordSheetLineProps = {
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

function PositionedChords({ chordLine }: { chordLine: string }) {
  if (!chordLine) return null;

  return (
    <Text color="blue" inherit sx={{ fontFamily: 'monospace', whiteSpace: 'pre' }}>
      {chordLine}
    </Text>
  );
}

function ChordSheetLine(props: ChordSheetLineProps) {
  const { line, repeatTimes, showChords, transpose } = props;
  const chordLine = line.chords ? formatPositionedChords(line.chords, transpose) : '';
  const repeatLabel = repeatTimes ? ` (${repeatTimes}x)` : '';

  return (
    <Box mb={showChords && chordLine ? 6 : 0}>
      {showChords && <PositionedChords chordLine={chordLine} />}
      <Text inherit sx={{ fontFamily: 'inherit', whiteSpace: showChords ? 'pre' : 'pre-wrap' }}>
        <FormattedLyrics line={line} />
        {repeatLabel}
      </Text>
    </Box>
  );
}

function MusicalSectionLabel({ label }: { label?: string }) {
  if (!label) return null;

  return (
    <Text color="dimmed" mb={4} size="sm" weight={600}>
      {label}
    </Text>
  );
}

function MusicalSectionLines({ fontSize, section, showChords, transpose }: HymnSectionProps) {
  return (
    <Text component="div" size={fontSize} sx={{ minWidth: 0 }}>
      {section.lines.map((line) => (
        <ChordSheetLine
          key={line.id}
          line={line}
          repeatTimes={findRepeatTimes(section, line.id)}
          showChords={showChords}
          transpose={transpose}
        />
      ))}
    </Text>
  );
}

function MusicalSection(props: HymnSectionProps) {
  return (
    <Box mt={16} sx={{ overflowX: props.showChords ? 'auto' : 'visible' }}>
      <MusicalSectionLabel label={props.section.label} />
      <MusicalSectionLines {...props} />
    </Box>
  );
}

function LegacyLines({ lines }: Pick<RenderableSection, 'lines'>) {
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

function LegacySection({ fontSize, section }: HymnSectionProps) {
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
export function HymnSection(props: HymnSectionProps) {
  if (props.isMusical) {
    return <MusicalSection {...props} />;
  }

  return <LegacySection {...props} />;
}

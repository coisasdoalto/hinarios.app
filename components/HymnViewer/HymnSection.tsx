import { Box, MantineSize, Text } from '@mantine/core';
import { formatPositionedChords } from '../../chord-sheets/transposeChordSheet';
import { RenderableLine, RenderableSection } from '../../domain/hymn/renderableHymn.types';
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

function PositionedChords({ chordLine }: { chordLine: string }) {
  if (!chordLine) return null;

  return (
    <Text color="blue" inherit sx={{ whiteSpace: 'pre' }}>
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
      <Text inherit sx={{ whiteSpace: showChords ? 'pre' : 'pre-wrap' }}>
        {line.text}
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
    <Text
      component="div"
      size={fontSize}
      sx={{ fontFamily: showChords ? 'monospace' : 'inherit', minWidth: 0 }}
    >
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

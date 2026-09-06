import { Box, MantineSize, Text } from '@mantine/core';

import { Hymn } from '../../schemas/hymn';
import { HymnTextWithVariations } from '../HymnTextWithVariations';

export type LyricsLayout = 'grid' | 'normal';

type IndexedLyric = {
  index: number;
  lyric: Hymn['lyrics'][number];
};

export type HymnLyricsProps = {
  fontSize: MantineSize;
  layout: LyricsLayout;
  lyrics: Hymn['lyrics'];
};

export const splitLyricsIntoColumns = <T,>(items: T[]): T[][] => {
  if (items.length < 2) return [items];

  const secondColumnStart = Math.ceil(items.length / 2);

  return [items.slice(0, secondColumnStart), items.slice(secondColumnStart)];
};

function Lyric({ fontSize, lyric }: { fontSize: MantineSize; lyric: IndexedLyric['lyric'] }) {
  if (lyric.type === 'chorus') {
    return (
      <Text size={fontSize} mt={16} pl={40} italic>
        <HymnTextWithVariations>{lyric.text}</HymnTextWithVariations>
      </Text>
    );
  }

  if (lyric.type === 'unnumbered_stanza') {
    return (
      <Text size={fontSize} mt={16} pl={20} style={{ position: 'relative' }}>
        <HymnTextWithVariations>{lyric.text}</HymnTextWithVariations>
      </Text>
    );
  }

  return (
    <Text size={fontSize} mt={16} pl={20} style={{ position: 'relative' }}>
      <span style={{ position: 'absolute', left: 0 }}>{lyric.number}.</span>
      <HymnTextWithVariations>{lyric.text}</HymnTextWithVariations>
    </Text>
  );
}

export function HymnLyrics({ fontSize, layout, lyrics }: HymnLyricsProps) {
  const indexedLyrics = lyrics.map((lyric, index) => ({ index, lyric }));
  const columns = layout === 'grid' ? splitLyricsIntoColumns(indexedLyrics) : [indexedLyrics];

  return (
    <Box
      data-layout={layout}
      data-testid="hymn-lyrics"
      sx={(theme) => ({
        display: 'grid',
        gridTemplateColumns: '1fr',
        columnGap: theme.spacing.lg,
        [theme.fn.largerThan('md')]: {
          gridTemplateColumns: columns.length > 1 ? 'repeat(2, minmax(0, 1fr))' : '1fr',
        },
      })}
    >
      {columns.map((column) => (
        <Box
          key={column[0]?.index ?? 0}
          data-testid="lyrics-column"
          style={{
            minWidth: 0,
            ...(layout === 'normal'
              ? {
                  justifySelf: 'center',
                  maxWidth: '100%',
                  textAlign: 'left',
                  width: 'fit-content',
                }
              : {}),
          }}
        >
          {column.map(({ index, lyric }) => (
            <Lyric key={index} fontSize={fontSize} lyric={lyric} />
          ))}
        </Box>
      ))}
    </Box>
  );
}

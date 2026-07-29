import { RenderableTextSegment } from '../domain/hymn/renderableHymn.types';

export type ParsedMarkdownLyrics = {
  markerColumns: number[];
  segments?: RenderableTextSegment[];
  text: string;
};

const EMPHASIS_MARKER =
  /(\*\*\*|___)(?=\S)(.+?\S)\1|(\*\*|__)(?=\S)(.+?\S)\3|(\*|_)(?=\S)(.+?\S)\5/gsu;

type ParsedMarkdownAccumulator = {
  markerColumns: number[];
  segments: RenderableTextSegment[];
  text: string;
};

function appendTextSegment(
  segments: RenderableTextSegment[],
  text: string,
  styles: Pick<RenderableTextSegment, 'bold' | 'italic'> = {}
): void {
  if (!text) return;
  segments.push({ text, ...styles });
}

function resolveEmphasisMatch(match: RegExpExecArray): {
  content: string;
  marker: string;
  styles: Pick<RenderableTextSegment, 'bold' | 'italic'>;
} {
  if (match[1])
    return { content: match[2], marker: match[1], styles: { bold: true, italic: true } };
  if (match[3]) return { content: match[4], marker: match[3], styles: { bold: true } };
  return { content: match[6], marker: match[5], styles: { italic: true } };
}

function appendMarkerColumns(markerColumns: number[], start: number, markerLength: number): void {
  for (let markerIndex = 0; markerIndex < markerLength; markerIndex += 1) {
    markerColumns.push(start + markerIndex);
  }
}

function parseEmphasisMatches(sourceText: string): ParsedMarkdownLyrics {
  const markerColumns: number[] = [];
  const segments: RenderableTextSegment[] = [];
  let sourceCursor = 0;
  let emphasisMatch = EMPHASIS_MARKER.exec(sourceText);

  while (emphasisMatch) {
    const { content, marker, styles } = resolveEmphasisMatch(emphasisMatch);
    appendTextSegment(segments, sourceText.slice(sourceCursor, emphasisMatch.index));
    appendTextSegment(segments, content, styles);
    appendMarkerColumns(markerColumns, emphasisMatch.index, marker.length);
    const closingMarkerStart = emphasisMatch.index + emphasisMatch[0].length - marker.length;
    appendMarkerColumns(markerColumns, closingMarkerStart, marker.length);
    sourceCursor = emphasisMatch.index + emphasisMatch[0].length;
    emphasisMatch = EMPHASIS_MARKER.exec(sourceText);
  }

  appendTextSegment(segments, sourceText.slice(sourceCursor));
  return { markerColumns, segments, text: segments.map(({ text }) => text).join('') };
}

function createLineAccumulators(sourceLines: string[]): ParsedMarkdownAccumulator[] {
  return sourceLines.map(() => ({ markerColumns: [], segments: [], text: '' }));
}

function appendSegmentAcrossLines(
  parsedLines: ParsedMarkdownAccumulator[],
  segment: RenderableTextSegment,
  startingLineIndex: number
): number {
  const { text, ...styles } = segment;
  let lineIndex = startingLineIndex;

  text.split('\n').forEach((lineText, segmentLineIndex) => {
    if (segmentLineIndex > 0) lineIndex += 1;
    appendTextSegment(parsedLines[lineIndex].segments, lineText, styles);
    parsedLines[lineIndex].text += lineText;
  });
  return lineIndex;
}

function assignMarkerColumns(
  sourceLines: string[],
  markerIndexes: number[],
  parsedLines: ParsedMarkdownAccumulator[]
): void {
  let sourceOffset = 0;
  sourceLines.forEach((sourceLine, lineIndex) => {
    const lineEnd = sourceOffset + sourceLine.length;
    parsedLines[lineIndex].markerColumns = markerIndexes
      .filter((markerIndex) => markerIndex >= sourceOffset && markerIndex < lineEnd)
      .map((markerIndex) => markerIndex - sourceOffset);
    sourceOffset = lineEnd + 1;
  });
}

/**
 * Converts supported Markdown emphasis markers into serializable lyric segments.
 *
 * @example parseMarkdownLyrics('Eu **te** *adoro*')
 */
export function parseMarkdownLyrics(sourceText: string): ParsedMarkdownLyrics {
  EMPHASIS_MARKER.lastIndex = 0;
  const parsedLyrics = parseEmphasisMatches(sourceText);
  if (parsedLyrics.markerColumns.length > 0) return parsedLyrics;
  return { markerColumns: [], text: sourceText };
}

/**
 * Converts Markdown emphasis spanning one or more lyric lines.
 *
 * @example parseMarkdownLyricsLines(['*Primeira linha', 'segunda linha.*'])
 */
export function parseMarkdownLyricsLines(sourceLines: string[]): ParsedMarkdownLyrics[] {
  const parsedLyrics = parseMarkdownLyrics(sourceLines.join('\n'));
  if (!parsedLyrics.segments) {
    return sourceLines.map((text) => ({ markerColumns: [], text }));
  }

  const parsedLines = createLineAccumulators(sourceLines);
  let lineIndex = 0;
  parsedLyrics.segments.forEach((segment) => {
    lineIndex = appendSegmentAcrossLines(parsedLines, segment, lineIndex);
  });
  assignMarkerColumns(sourceLines, parsedLyrics.markerColumns, parsedLines);
  return parsedLines;
}

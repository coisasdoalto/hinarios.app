import {
  PositionedChord,
  RenderableLine,
  RenderableSection,
  RepeatGroup,
} from '../domain/hymn/renderableHymn.types';
import { MusicTheory, tonalMusicTheory } from './musicTheory';
import { parseMarkdownLyrics } from './parseMarkdownLyrics';

const KEY_DIRECTIVE = /^TOM\s+%(\S+)\s*$/iu;
const SECTION_LABEL = /^\[([^\]]+)\]\s*$/u;
const REPEAT_OPENING = /^(\s*)\{/u;
const REPEAT_CLOSING = /\}\s*\((\d+)x\)\s*$/u;
const CHORD_LINE_DECORATION = /^[()]$/u;

type ChordSheetSourceBlock = {
  label?: string;
  lines: string[];
};

export type ParsedChordSheet = {
  originalKey?: string;
  sections: RenderableSection[];
};

function appendSourceBlock(
  sourceBlocks: ChordSheetSourceBlock[],
  activeBlock: ChordSheetSourceBlock
): void {
  if (activeBlock.label || activeBlock.lines.length > 0) {
    sourceBlocks.push(activeBlock);
  }
}

function startSourceBlock(
  sourceBlocks: ChordSheetSourceBlock[],
  activeBlock: ChordSheetSourceBlock,
  label?: string
): ChordSheetSourceBlock {
  appendSourceBlock(sourceBlocks, activeBlock);
  return { ...(label && { label }), lines: [] };
}

function consumeSourceLine(
  sourceBlocks: ChordSheetSourceBlock[],
  activeBlock: ChordSheetSourceBlock,
  sourceLine: string
): ChordSheetSourceBlock {
  const labelMatch = SECTION_LABEL.exec(sourceLine);
  if (labelMatch) {
    return startSourceBlock(sourceBlocks, activeBlock, labelMatch[1].trim());
  }
  if (sourceLine.trim() === '' && activeBlock.lines.length > 0) {
    return startSourceBlock(sourceBlocks, activeBlock);
  }
  if (sourceLine.trim() !== '') {
    activeBlock.lines.push(sourceLine);
  }
  return activeBlock;
}

function splitChordSheetBlocks(sourceLines: string[]): ChordSheetSourceBlock[] {
  const sourceBlocks: ChordSheetSourceBlock[] = [];
  let activeBlock: ChordSheetSourceBlock = { lines: [] };
  sourceLines.forEach((sourceLine) => {
    activeBlock = consumeSourceLine(sourceBlocks, activeBlock, sourceLine);
  });

  appendSourceBlock(sourceBlocks, activeBlock);
  return sourceBlocks;
}

function parsePositionedChords(
  sourceLine: string,
  musicTheory: MusicTheory
): PositionedChord[] | null {
  const chordTokens: PositionedChord[] = [];
  const chordTokenPattern = /\S+/gu;
  let chordMatch = chordTokenPattern.exec(sourceLine);

  while (chordMatch) {
    if (CHORD_LINE_DECORATION.test(chordMatch[0])) {
      chordMatch = chordTokenPattern.exec(sourceLine);
      continue;
    }
    if (!musicTheory.isChordSymbol(chordMatch[0])) {
      return null;
    }

    chordTokens.push({ symbol: chordMatch[0], column: chordMatch.index });
    chordMatch = chordTokenPattern.exec(sourceLine);
  }

  return chordTokens.length > 0 ? chordTokens : null;
}

function appendRenderableLine(
  renderableLines: RenderableLine[],
  sectionId: string,
  text: string,
  chords?: PositionedChord[]
): void {
  const lineNumber = renderableLines.length + 1;
  renderableLines.push({
    id: `${sectionId}/line-${lineNumber}`,
    text,
    ...(chords && { chords }),
  });
}

function consumeBlockLine(
  renderableLines: RenderableLine[],
  sectionId: string,
  sourceLine: string,
  pendingChords: PositionedChord[] | undefined,
  musicTheory: MusicTheory
): PositionedChord[] | undefined {
  const positionedChords = parsePositionedChords(sourceLine, musicTheory);
  if (!positionedChords) {
    appendRenderableLine(renderableLines, sectionId, sourceLine, pendingChords);
    return undefined;
  }
  if (pendingChords) appendRenderableLine(renderableLines, sectionId, '', pendingChords);
  return positionedChords;
}

function parseBlockLines(
  sourceLines: string[],
  sectionId: string,
  musicTheory: MusicTheory
): RenderableLine[] {
  const renderableLines: RenderableLine[] = [];
  let pendingChords: PositionedChord[] | undefined;

  sourceLines.forEach((sourceLine) => {
    pendingChords = consumeBlockLine(
      renderableLines,
      sectionId,
      sourceLine,
      pendingChords,
      musicTheory
    );
  });
  if (pendingChords) appendRenderableLine(renderableLines, sectionId, '', pendingChords);
  return renderableLines;
}

function resolveSectionIdentity(label?: string): Pick<RenderableSection, 'type' | 'number'> {
  const normalizedLabel = label?.toLocaleLowerCase('pt-BR');
  if (normalizedLabel === 'refrão') {
    return { type: 'chorus' };
  }
  if (normalizedLabel === 'ponte') {
    return { type: 'bridge' };
  }

  const stanzaMatch = /^(?:estrofe|verso)\s*(\d+)$/u.exec(normalizedLabel ?? '');
  if (stanzaMatch) {
    return { type: 'stanza', number: Number(stanzaMatch[1]) };
  }

  return { type: 'unnumbered' };
}

function removeRepeatOpening(line: RenderableLine): RenderableLine {
  const openingMatch = REPEAT_OPENING.exec(line.text);
  if (!openingMatch) {
    return line;
  }

  const braceColumn = openingMatch[1].length;
  const adjustedChords = line.chords?.map((chord) => ({
    ...chord,
    column: chord.column > braceColumn ? chord.column - 1 : chord.column,
  }));

  return {
    ...line,
    text: `${openingMatch[1]}${line.text.slice(braceColumn + 1)}`,
    ...(adjustedChords && { chords: adjustedChords }),
  };
}

function appendRepeatGroup(
  lines: RenderableLine[],
  repeats: RepeatGroup[],
  sectionId: string,
  openingLineIndex: number,
  closingLineIndex: number,
  times: number
): void {
  repeats.push({
    id: `${sectionId}/repeat-${repeats.length + 1}`,
    times,
    lineIds: lines.slice(openingLineIndex, closingLineIndex + 1).map(({ id }) => id),
  });
}

function closeRepeatGroup(
  lines: RenderableLine[],
  repeats: RepeatGroup[],
  sectionId: string,
  openingLineIndex: number,
  closingLineIndex: number,
  closingMatch: RegExpExecArray
): void {
  lines[openingLineIndex] = removeRepeatOpening(lines[openingLineIndex]);
  const closingLine = lines[closingLineIndex];
  lines[closingLineIndex] = { ...closingLine, text: closingLine.text.replace(REPEAT_CLOSING, '') };
  appendRepeatGroup(
    lines,
    repeats,
    sectionId,
    openingLineIndex,
    closingLineIndex,
    Number(closingMatch[1])
  );
}

function extractRepeatGroups(
  sourceLines: RenderableLine[],
  sectionId: string
): { lines: RenderableLine[]; repeats?: RepeatGroup[] } {
  const lines = [...sourceLines];
  const repeats: RepeatGroup[] = [];
  let openingLineIndex: number | undefined;

  lines.forEach((line, lineIndex) => {
    if (openingLineIndex === undefined && REPEAT_OPENING.test(line.text))
      openingLineIndex = lineIndex;
    const closingMatch = REPEAT_CLOSING.exec(line.text);
    if (closingMatch && openingLineIndex !== undefined) {
      closeRepeatGroup(lines, repeats, sectionId, openingLineIndex, lineIndex, closingMatch);
      openingLineIndex = undefined;
    }
  });
  return { lines, ...(repeats.length > 0 && { repeats }) };
}

function adjustChordColumns(
  chords: PositionedChord[] | undefined,
  markerColumns: number[]
): PositionedChord[] | undefined {
  return chords?.map((chord) => {
    const precedingMarkers = markerColumns.filter((column) => column < chord.column).length;
    return { ...chord, column: Math.max(chord.column - precedingMarkers, 0) };
  });
}

function parseRenderableLineMarkdown(line: RenderableLine): RenderableLine {
  const parsedLyrics = parseMarkdownLyrics(line.text);
  if (!parsedLyrics.segments) return line;
  const adjustedChords = adjustChordColumns(line.chords, parsedLyrics.markerColumns);

  return {
    ...line,
    text: parsedLyrics.text,
    segments: parsedLyrics.segments,
    ...(adjustedChords && { chords: adjustedChords }),
  };
}

function createRenderableSection(
  sourceBlock: ChordSheetSourceBlock,
  hymnId: string,
  sectionIndex: number,
  musicTheory: MusicTheory
): RenderableSection {
  const sectionId = `${hymnId}/section-${sectionIndex + 1}`;
  const sourceLines = parseBlockLines(sourceBlock.lines, sectionId, musicTheory);
  const { lines: repeatedLines, repeats } = extractRepeatGroups(sourceLines, sectionId);
  const lines = repeatedLines.map(parseRenderableLineMarkdown);

  return {
    id: sectionId,
    ...resolveSectionIdentity(sourceBlock.label),
    ...(sourceBlock.label && { label: sourceBlock.label }),
    lines,
    ...(repeats && { repeats }),
  };
}

function extractKeyDirective(sourceLines: string[]): {
  originalKey?: string;
  contentLines: string[];
} {
  const firstContentLineIndex = sourceLines.findIndex((line) => line.trim() !== '');
  const keyMatch = KEY_DIRECTIVE.exec(sourceLines[firstContentLineIndex] ?? '');
  if (!keyMatch) {
    return { contentLines: sourceLines };
  }

  return {
    originalKey: keyMatch[1],
    contentLines: sourceLines.filter((_, index) => index !== firstContentLineIndex),
  };
}

/**
 * Parses the canonical Obsidian chords source into a serializable presentation AST.
 *
 * @example parseChordSheet('TOM %G\n\nG\nExample', 'book/1')
 */
export function parseChordSheet(
  sourceContent: string,
  hymnId: string,
  musicTheory: MusicTheory = tonalMusicTheory
): ParsedChordSheet {
  const normalizedLines = sourceContent.replace(/\r\n?/gu, '\n').split('\n');
  const { originalKey, contentLines } = extractKeyDirective(normalizedLines);
  const sourceBlocks = splitChordSheetBlocks(contentLines);
  const sections = sourceBlocks.map((sourceBlock, sectionIndex) =>
    createRenderableSection(sourceBlock, hymnId, sectionIndex, musicTheory)
  );

  return { originalKey, sections };
}

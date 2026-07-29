import { PositionedChord } from '../domain/hymn/renderableHymn.types';
import { MusicTheory, tonalMusicTheory } from './musicTheory';

export type FormattedChordToken = {
  leadingSpaces: string;
  symbol: string;
};

/**
 * Transposes a chord symbol without changing its persisted source.
 *
 * @example transposeChordSymbol('G/B', 2)
 */
export function transposeChordSymbol(
  chordSymbol: string,
  semitones: number,
  musicTheory: MusicTheory = tonalMusicTheory
): string {
  return musicTheory.transposeChord(chordSymbol, semitones);
}

/**
 * Formats positioned chords as separate tokens for interactive rendering.
 *
 * @example formatPositionedChordTokens([{ symbol: 'C', column: 2 }], 0)
 */
export function formatPositionedChordTokens(
  positionedChords: PositionedChord[],
  semitones: number,
  musicTheory: MusicTheory = tonalMusicTheory
): FormattedChordToken[] {
  let chordLineLength = 0;
  return positionedChords.map((positionedChord) => {
    const symbol = transposeChordSymbol(positionedChord.symbol, semitones, musicTheory);
    const minimumColumn = chordLineLength > 0 ? chordLineLength + 1 : 0;
    const targetColumn = Math.max(positionedChord.column, minimumColumn);
    const leadingSpaces = ' '.repeat(targetColumn - chordLineLength);
    chordLineLength = targetColumn + symbol.length;
    return { leadingSpaces, symbol };
  });
}

/**
 * Formats positioned chords as one aligned monospaced display line.
 *
 * @example formatPositionedChords([{ symbol: 'C', column: 2 }], 0)
 */
export function formatPositionedChords(
  positionedChords: PositionedChord[],
  semitones: number,
  musicTheory: MusicTheory = tonalMusicTheory
): string {
  return formatPositionedChordTokens(positionedChords, semitones, musicTheory)
    .map(({ leadingSpaces, symbol }) => `${leadingSpaces}${symbol}`)
    .join('');
}

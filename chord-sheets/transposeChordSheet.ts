import { PositionedChord } from '../domain/hymn/renderableHymn.types';
import { MusicTheory, tonalMusicTheory } from './musicTheory';

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
 * Formats positioned chords as one aligned monospaced display line.
 *
 * @example formatPositionedChords([{ symbol: 'C', column: 2 }], 0)
 */
export function formatPositionedChords(
  positionedChords: PositionedChord[],
  semitones: number,
  musicTheory: MusicTheory = tonalMusicTheory
): string {
  return positionedChords.reduce((chordLine, positionedChord) => {
    const transposedSymbol = transposeChordSymbol(positionedChord.symbol, semitones, musicTheory);
    const minimumColumn = chordLine.length > 0 ? chordLine.length + 1 : 0;
    const targetColumn = Math.max(positionedChord.column, minimumColumn);

    return `${chordLine}${' '.repeat(targetColumn - chordLine.length)}${transposedSymbol}`;
  }, '');
}

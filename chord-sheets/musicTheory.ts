import { Chord, Interval } from 'tonal';

const BRAZILIAN_MAJOR_SEVENTH = '7M';
const TONAL_MAJOR_SEVENTH = 'maj7';

export interface MusicTheory {
  isChordSymbol(symbol: string): boolean;
  transposeChord(symbol: string, semitones: number): string;
}

function toTonalChordSymbol(symbol: string): string {
  return symbol.replace(BRAZILIAN_MAJOR_SEVENTH, TONAL_MAJOR_SEVENTH);
}

function restoreChordNotation(originalSymbol: string, transposedSymbol: string): string {
  if (!originalSymbol.includes(BRAZILIAN_MAJOR_SEVENTH)) return transposedSymbol;
  return transposedSymbol.replace(TONAL_MAJOR_SEVENTH, BRAZILIAN_MAJOR_SEVENTH);
}

function transposeTonalChord(symbol: string, semitones: number): string {
  const interval = Interval.fromSemitones(semitones);
  const transposedChord = Chord.transpose(toTonalChordSymbol(symbol), interval);
  if (transposedChord) return restoreChordNotation(symbol, transposedChord);

  throw new Error(
    `Invalid chord symbol "${symbol}"; expected a transposable chord for offset "${semitones}"`
  );
}

export const tonalMusicTheory: MusicTheory = {
  isChordSymbol(symbol: string): boolean {
    return !Chord.get(toTonalChordSymbol(symbol)).empty;
  },

  transposeChord(symbol: string, semitones: number): string {
    return semitones === 0 ? symbol : transposeTonalChord(symbol, semitones);
  },
};

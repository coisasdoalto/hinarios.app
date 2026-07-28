import { RenderableHymn } from '../domain/hymn/renderableHymn.types';
import { transposeChordSymbol } from './transposeChordSheet';

/**
 * Extracts transposed chord symbols in their first-appearance order.
 *
 * @example extractUniqueChordSymbols(hymn, 2)
 */
export function extractUniqueChordSymbols(hymn: RenderableHymn, semitones: number): string[] {
  const uniqueSymbols = new Set<string>();

  hymn.sections.forEach((section) => {
    section.lines.forEach((line) => {
      line.chords?.forEach((chord) => {
        uniqueSymbols.add(transposeChordSymbol(chord.symbol, semitones));
      });
    });
  });

  return Array.from(uniqueSymbols);
}

import guitarDatabaseJson from '@tombatossals/chords-db/lib/guitar.json';
import { Note } from 'tonal';
import { ChordDictionary, GuitarChordPosition, GuitarChordVariations } from './chordDiagram.types';

type DatabaseChord = {
  key: string;
  positions: GuitarChordPosition[];
  suffix: string;
};

type GuitarDatabase = {
  chords: Record<string, DatabaseChord[]>;
};

const guitarDatabase = guitarDatabaseJson as GuitarDatabase;

const DATABASE_KEYS_BY_CHROMA = [
  'C',
  'Csharp',
  'D',
  'Eb',
  'E',
  'F',
  'Fsharp',
  'G',
  'Ab',
  'A',
  'Bb',
  'B',
];

function normalizeDatabaseSuffix(suffix: string): string {
  return suffix
    .replace(/^m$/u, 'minor')
    .replace(/^$/u, 'major')
    .replace(/7M/gu, 'maj7')
    .replace(/m7\(b5\)/gu, 'm7b5')
    .replace(/\(add9\)/gu, 'add9')
    .replace(/^4$/u, 'sus4')
    .replace(/°/gu, 'dim');
}

function splitChordSymbol(symbol: string): { key: string; suffix: string } | undefined {
  const matchedSymbol = /^([A-Ga-g](?:#|b)*)(.*)$/u.exec(symbol.trim());
  if (!matchedSymbol) return undefined;

  const normalizedKey = `${matchedSymbol[1][0].toUpperCase()}${matchedSymbol[1].slice(1)}`;
  const chroma = Note.chroma(normalizedKey);
  if (chroma === undefined) return undefined;

  return { key: DATABASE_KEYS_BY_CHROMA[chroma], suffix: matchedSymbol[2] };
}

function findDatabaseChord(chords: DatabaseChord[], suffix: string): DatabaseChord | undefined {
  const normalizedSuffix = normalizeDatabaseSuffix(suffix);
  const exactChord = chords.find((chord) => chord.suffix === normalizedSuffix);
  if (exactChord) return exactChord;

  const suffixWithoutBass = normalizeDatabaseSuffix(normalizedSuffix.split('/')[0]);
  return chords.find((chord) => chord.suffix === suffixWithoutBass);
}

/**
 * Finds guitar positions while preserving the chord symbol shown to the musician.
 *
 * @example guitarChordDictionary.findGuitarVariations('F7M')
 */
export const guitarChordDictionary: ChordDictionary = {
  findGuitarVariations(symbol: string): GuitarChordVariations | undefined {
    const chordParts = splitChordSymbol(symbol);
    if (!chordParts) return undefined;

    const databaseChord = findDatabaseChord(
      guitarDatabase.chords[chordParts.key] ?? [],
      chordParts.suffix
    );
    if (!databaseChord) return undefined;

    return { positions: databaseChord.positions, symbol };
  },
};

import { describe, expect, it } from '@jest/globals';
import { guitarChordDictionary } from './chordDictionary';

describe('guitarChordDictionary', () => {
  it.each(['G', 'Am', 'C#', 'F#m7', 'F7M', 'G4', 'D#°', 'Gm/Bb', 'B#', 'Gb7'])(
    'resolves the notation used by the Piracicaba hymn book: %s',
    (symbol) => {
      const chord = guitarChordDictionary.findGuitarVariations(symbol);

      expect(chord?.symbol).toBe(symbol);
      expect(chord?.positions.length).toBeGreaterThan(0);
    }
  );

  it('falls back to the base chord quality for unsupported inversions', () => {
    const invertedChord = guitarChordDictionary.findGuitarVariations('E7/G#');
    const baseChord = guitarChordDictionary.findGuitarVariations('E7');

    expect(invertedChord?.positions).toEqual(baseChord?.positions);
  });

  it('returns undefined for an unsupported symbol', () => {
    expect(guitarChordDictionary.findGuitarVariations('H13')).toBeUndefined();
  });
});

import { describe, expect, it } from '@jest/globals';
import { createSvguitarChord } from './svguitarRenderer';

describe('createSvguitarChord', () => {
  it('maps muted, open, fretted and barre strings to SVGuitar', () => {
    const chord = createSvguitarChord('F', {
      barres: [1],
      baseFret: 1,
      fingers: [1, 3, 4, 2, 1, 1],
      frets: [1, 3, 3, 2, 1, -1],
    });

    expect(chord.title).toBe('F');
    expect(chord.fingers).toEqual([
      [5, 3, '3'],
      [4, 3, '4'],
      [3, 2, '2'],
      [1, 'x'],
    ]);
    expect(chord.barres).toEqual([{ fret: 1, fromString: 6, text: '1', toString: 2 }]);
  });
});

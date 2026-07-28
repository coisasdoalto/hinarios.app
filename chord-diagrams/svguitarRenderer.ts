import { Barre, Chord, Finger, SVGuitarChord } from 'svguitar';
import { ChordDiagramRenderer, GuitarChordPosition } from './chordDiagram.types';

const GUITAR_STRING_COUNT = 6;

function createFinger(
  fret: number,
  finger: number,
  databaseStringIndex: number,
  barres: number[]
): Finger | undefined {
  const stringNumber = GUITAR_STRING_COUNT - databaseStringIndex;
  if (fret < 0) return [stringNumber, 'x'];
  if (fret === 0) return [stringNumber, 0];
  if (barres.includes(fret)) return undefined;

  return [stringNumber, fret, finger > 0 ? String(finger) : undefined];
}

function findBarreStrings(position: GuitarChordPosition, barreFret: number): number[] {
  return position.frets.flatMap((fret, index) => {
    return fret === barreFret ? [GUITAR_STRING_COUNT - index] : [];
  });
}

function createBarres(position: GuitarChordPosition): Barre[] {
  return position.barres.flatMap((fret) => {
    const barreStrings = findBarreStrings(position, fret);
    if (barreStrings.length === 0) return [];

    return [
      {
        fret,
        fromString: Math.max(...barreStrings),
        text: String(
          position.fingers.find((finger, index) => position.frets[index] === fret) ?? ''
        ),
        toString: Math.min(...barreStrings),
      },
    ];
  });
}

/**
 * Converts a chords-db position into SVGuitar's drawing contract.
 *
 * @example createSvguitarChord('G', guitarPosition)
 */
export function createSvguitarChord(symbol: string, position: GuitarChordPosition): Chord {
  const fingers = position.frets
    .map((fret, index) => createFinger(fret, position.fingers[index], index, position.barres))
    .filter((finger): finger is Finger => Boolean(finger));

  return {
    barres: createBarres(position),
    fingers,
    position: position.baseFret,
    title: symbol,
  };
}

/**
 * Draws one guitar position through the project-owned renderer interface.
 *
 * @example svguitarDiagramRenderer.draw(element, 'G', guitarPosition)
 */
export const svguitarDiagramRenderer: ChordDiagramRenderer = {
  draw(container: HTMLElement, symbol: string, position: GuitarChordPosition): void {
    container.replaceChildren();
    new SVGuitarChord(container)
      .configure({
        color: 'currentColor',
        frets: 4,
        noPosition: false,
        strings: GUITAR_STRING_COUNT,
        svgTitle: `Diagrama do acorde ${symbol}`,
      })
      .chord(createSvguitarChord(symbol, position))
      .draw();
  },
};

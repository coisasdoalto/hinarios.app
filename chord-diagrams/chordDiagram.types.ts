export type GuitarChordPosition = {
  barres: number[];
  baseFret: number;
  fingers: number[];
  frets: number[];
};

export type GuitarChordVariations = {
  positions: GuitarChordPosition[];
  symbol: string;
};

export interface ChordDictionary {
  findGuitarVariations(symbol: string): GuitarChordVariations | undefined;
}

export interface ChordDiagramRenderer {
  draw(container: HTMLElement, symbol: string, position: GuitarChordPosition): void;
}

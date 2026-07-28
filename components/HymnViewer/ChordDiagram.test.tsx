import { describe, expect, it } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { ChordDiagramRenderer, GuitarChordPosition } from '../../chord-diagrams/chordDiagram.types';
import { ChordDiagram } from './ChordDiagram';

class FakeChordDiagramRenderer implements ChordDiagramRenderer {
  drawnSymbols: string[] = [];

  draw(_container: HTMLElement, symbol: string, _position: GuitarChordPosition): void {
    this.drawnSymbols.push(symbol);
  }
}

describe('ChordDiagram', () => {
  it('draws a supported chord through the injected renderer', () => {
    const renderer = new FakeChordDiagramRenderer();

    render(
      <ChordDiagram
        onVariationChange={() => undefined}
        renderer={renderer}
        symbol="G"
        variationIndex={0}
      />
    );

    expect(renderer.drawnSymbols).toEqual(['G']);
    expect(screen.getByText('1/4')).toBeTruthy();
  });

  it('shows a safe fallback for an unsupported chord', () => {
    render(
      <ChordDiagram
        onVariationChange={() => undefined}
        renderer={new FakeChordDiagramRenderer()}
        symbol="H13"
        variationIndex={0}
      />
    );

    expect(screen.getByText('H13')).toBeTruthy();
    expect(screen.getByText('Diagrama indisponível')).toBeTruthy();
  });
});

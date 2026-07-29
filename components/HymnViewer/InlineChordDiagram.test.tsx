import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react';
import { ChordDiagramRenderer, GuitarChordPosition } from '../../chord-diagrams/chordDiagram.types';
import { InlineChordDiagram } from './InlineChordDiagram';

class FakeChordDiagramRenderer implements ChordDiagramRenderer {
  drawnSymbols: string[] = [];

  draw(_container: HTMLElement, symbol: string, _position: GuitarChordPosition): void {
    this.drawnSymbols.push(symbol);
  }
}

describe('InlineChordDiagram', () => {
  it('opens on hover and delegates variation changes', () => {
    const onVariationChange = jest.fn();
    const renderer = new FakeChordDiagramRenderer();
    render(
      <InlineChordDiagram
        onVariationChange={onVariationChange}
        renderer={renderer}
        symbol="G"
        variationIndex={0}
      />
    );

    fireEvent.mouseEnter(screen.getByRole('button', { name: 'Mostrar diagrama do acorde G' }));
    fireEvent.click(screen.getByLabelText('Mostrar próxima posição do acorde'));

    expect(renderer.drawnSymbols).toEqual(['G']);
    expect(onVariationChange).toHaveBeenCalledWith(1);
  });

  it('opens on click for devices without hover', () => {
    render(
      <InlineChordDiagram
        onVariationChange={() => undefined}
        renderer={new FakeChordDiagramRenderer()}
        symbol="C"
        variationIndex={0}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Mostrar diagrama do acorde C' }));

    expect(screen.getByText('1/4')).toBeTruthy();
  });
});

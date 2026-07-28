import { beforeEach, describe, expect, it } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react';
import { ChordDiagramRenderer, GuitarChordPosition } from '../../chord-diagrams/chordDiagram.types';
import { RenderableHymn } from '../../domain/hymn/renderableHymn.types';
import { ChordDiagramStrip } from './ChordDiagramStrip';

class FakeChordDiagramRenderer implements ChordDiagramRenderer {
  draw(_container: HTMLElement, _symbol: string, _position: GuitarChordPosition): void {}
}

const hymn: RenderableHymn = {
  editable: false,
  id: 'ev-1',
  musical: { originalKey: 'G', transposable: true },
  number: '1',
  sections: [
    {
      id: 'section-1',
      lines: [{ chords: [{ column: 0, symbol: 'G' }], id: 'line-1', text: 'Linha' }],
      type: 'unnumbered',
    },
  ],
  title: 'Meu Prazer',
};

describe('ChordDiagramStrip', () => {
  beforeEach(() => localStorage.clear());

  it('persists a manually selected variation', () => {
    const renderer = new FakeChordDiagramRenderer();
    const firstRender = render(<ChordDiagramStrip hymn={hymn} renderer={renderer} transpose={0} />);
    fireEvent.click(screen.getByLabelText('Mostrar próxima posição do acorde'));
    expect(screen.getByText('2/4')).toBeTruthy();
    firstRender.unmount();

    render(<ChordDiagramStrip hymn={hymn} renderer={renderer} transpose={0} />);

    expect(screen.getByText('2/4')).toBeTruthy();
  });

  it('resets visible variations after transposition', () => {
    const renderer = new FakeChordDiagramRenderer();
    localStorage.setItem('chordSheet.selectedVariations', JSON.stringify({ C: 2 }));
    const strip = render(<ChordDiagramStrip hymn={hymn} renderer={renderer} transpose={0} />);
    fireEvent.click(screen.getByLabelText('Mostrar próxima posição do acorde'));

    strip.rerender(<ChordDiagramStrip hymn={hymn} renderer={renderer} transpose={1} />);

    expect(screen.getByText(/^1\//u)).toBeTruthy();
    expect(JSON.parse(localStorage.getItem('chordSheet.selectedVariations') ?? '{}')).toMatchObject(
      {
        C: 2,
      }
    );
  });
});

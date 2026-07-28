import { beforeEach, describe, expect, it } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react';
import { ChordDiagramRenderer, GuitarChordPosition } from '../../chord-diagrams/chordDiagram.types';
import { RenderableHymn } from '../../domain/hymn/renderableHymn.types';
import { HymnViewer } from './HymnViewer';

class FakeChordDiagramRenderer implements ChordDiagramRenderer {
  draw(_container: HTMLElement, _symbol: string, _position: GuitarChordPosition): void {}
}

const diagramRenderer = new FakeChordDiagramRenderer();

const chordSheetHymn: RenderableHymn = {
  id: 'ev-1',
  number: '1',
  title: 'Meu Prazer',
  editable: false,
  musical: { originalKey: 'G', transposable: true },
  sections: [
    {
      id: 'section-1',
      type: 'unnumbered',
      lines: [
        {
          id: 'line-1',
          text: 'Em espírito, em verdade',
          chords: [{ symbol: 'G', column: 0 }],
        },
      ],
    },
  ],
};

describe('HymnViewer', () => {
  beforeEach(() => localStorage.clear());

  it('shows V2 chords by default and transposes only the presentation', () => {
    render(<HymnViewer diagramRenderer={diagramRenderer} hymn={chordSheetHymn} showChords />);

    fireEvent.click(screen.getByLabelText('Transpor um semitom acima'));

    expect(screen.getByText(/Tom original: G/u)).toBeTruthy();
    expect(screen.getByText(/Tom atual: Ab/u)).toBeTruthy();
    expect(screen.getByText('Ab')).toBeTruthy();
    expect(chordSheetHymn.sections[0].lines[0].chords?.[0].symbol).toBe('G');
  });

  it('hides chords and transposition controls without losing transpose state', () => {
    const viewer = render(
      <HymnViewer diagramRenderer={diagramRenderer} hymn={chordSheetHymn} showChords />
    );
    fireEvent.click(screen.getByLabelText('Transpor um semitom acima'));
    viewer.rerender(
      <HymnViewer diagramRenderer={diagramRenderer} hymn={chordSheetHymn} showChords={false} />
    );

    expect(screen.getByText(/Tom original: G/u)).toBeTruthy();
    expect(screen.queryByText(/Tom atual: Ab/u)).toBeNull();
    expect(screen.queryByText('Ab')).toBeNull();
    expect(screen.queryByRole('region', { name: 'Diagramas dos acordes' })).toBeNull();

    viewer.rerender(
      <HymnViewer diagramRenderer={diagramRenderer} hymn={chordSheetHymn} showChords />
    );
    expect(screen.getByText(/Tom atual: Ab/u)).toBeTruthy();
  });

  it('keeps legacy hymns free of musical controls', () => {
    render(
      <HymnViewer
        diagramRenderer={diagramRenderer}
        hymn={{ ...chordSheetHymn, musical: undefined }}
        showChords
      />
    );

    expect(screen.queryByText(/Tom original:/u)).toBeNull();
    expect(screen.queryByRole('region', { name: 'Diagramas dos acordes' })).toBeNull();
    expect(screen.getByText('Em espírito, em verdade')).toBeTruthy();
  });
});

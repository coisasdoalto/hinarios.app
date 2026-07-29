import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react';
import { ChordDiagramRenderer, GuitarChordPosition } from '../../chord-diagrams/chordDiagram.types';
import { RenderableHymn } from '../../domain/hymn/renderableHymn.types';
import { AutoScrollViewport } from '../../hooks/useHymnAutoScroll';
import { HymnViewer } from './HymnViewer';

class FakeChordDiagramRenderer implements ChordDiagramRenderer {
  draw(_container: HTMLElement, _symbol: string, _position: GuitarChordPosition): void {}
}

const diagramRenderer = new FakeChordDiagramRenderer();

class FakeAutoScrollViewport implements AutoScrollViewport {
  cancelFrame(_frameId: number): void {}
  getMaximumScrollTop(): number {
    return 100;
  }
  getScrollTop(): number {
    return 0;
  }
  requestFrame(_callback: FrameRequestCallback): number {
    return 1;
  }
  scrollTo(_scrollTop: number): void {}
}

const autoScrollViewport = new FakeAutoScrollViewport();

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
    expect(screen.queryByText(/Tom atual:/u)).toBeNull();
    expect(screen.getAllByText('Ab')).toHaveLength(2);
    expect(chordSheetHymn.sections[0].lines[0].chords?.[0].symbol).toBe('G');

    const restoreKeyButton = screen.getByRole('button', { name: 'Restaurar tom original' });
    expect(restoreKeyButton.textContent).toBe('Ab');
    fireEvent.click(restoreKeyButton);
    expect(restoreKeyButton.textContent).toBe('G');
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
    expect(screen.queryByText(/Tom atual:/u)).toBeNull();
    expect(screen.queryByText('Ab')).toBeNull();
    expect(screen.queryByRole('region', { name: 'Diagramas dos acordes' })).toBeNull();
    expect(screen.queryByRole('checkbox', { name: 'Rolagem automática' })).toBeNull();

    viewer.rerender(
      <HymnViewer diagramRenderer={diagramRenderer} hymn={chordSheetHymn} showChords />
    );
    expect(screen.getByRole('button', { name: 'Restaurar tom original' }).textContent).toBe('Ab');
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
    expect(screen.queryByRole('checkbox', { name: 'Rolagem automática' })).toBeNull();
    expect(screen.getByText('Em espírito, em verdade')).toBeTruthy();
  });

  it('reports enabled state and keeps scrolling when the lyrics are clicked', () => {
    const onAutoScrollEnabledChange = jest.fn();
    render(
      <HymnViewer
        autoScrollViewport={autoScrollViewport}
        diagramRenderer={diagramRenderer}
        hymn={chordSheetHymn}
        onAutoScrollEnabledChange={onAutoScrollEnabledChange}
        showChords
      />
    );
    fireEvent.click(screen.getByRole('checkbox', { name: 'Rolagem automática' }));
    fireEvent.click(screen.getByText('Em espírito, em verdade'));

    expect(onAutoScrollEnabledChange).toHaveBeenLastCalledWith(true);
    expect(screen.getByRole('button', { name: 'Pausar' })).toBeTruthy();
  });

  it('stops autoscroll when chords are hidden', () => {
    const onAutoScrollEnabledChange = jest.fn();
    const viewer = render(
      <HymnViewer
        autoScrollViewport={autoScrollViewport}
        diagramRenderer={diagramRenderer}
        hymn={chordSheetHymn}
        onAutoScrollEnabledChange={onAutoScrollEnabledChange}
        showChords
      />
    );
    fireEvent.click(screen.getByRole('checkbox', { name: 'Rolagem automática' }));

    viewer.rerender(
      <HymnViewer
        autoScrollViewport={autoScrollViewport}
        diagramRenderer={diagramRenderer}
        hymn={chordSheetHymn}
        onAutoScrollEnabledChange={onAutoScrollEnabledChange}
        showChords={false}
      />
    );

    expect(screen.queryByRole('checkbox', { name: 'Rolagem automática' })).toBeNull();
    expect(onAutoScrollEnabledChange).toHaveBeenLastCalledWith(false);
  });
});

import { beforeEach, describe, expect, it } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react';
import { ChordDiagramRenderer, GuitarChordPosition } from '../../chord-diagrams/chordDiagram.types';
import { RenderableSection } from '../../domain/hymn/renderableHymn.types';
import { HymnSection } from './HymnSection';
import { CHORD_VARIATIONS_STORAGE_KEY } from './useStoredChordVariations';

class FakeChordDiagramRenderer implements ChordDiagramRenderer {
  draw(_container: HTMLElement, _symbol: string, _position: GuitarChordPosition): void {}
}

const formattedSection: RenderableSection = {
  id: 'ev-1/section-1',
  type: 'unnumbered',
  lines: [
    {
      id: 'ev-1/section-1/line-1',
      text: 'Cantamos para sempre',
      chords: [{ symbol: 'C', column: 0 }],
      segments: [
        { text: 'Cantamos ' },
        { text: 'para', italic: true },
        { text: ' ' },
        { text: 'sempre', bold: true, italic: true },
      ],
    },
  ],
};

describe('HymnSection', () => {
  beforeEach(() => localStorage.clear());

  it('renders normalized Markdown emphasis without showing its markers', () => {
    render(
      <HymnSection fontSize="md" isMusical section={formattedSection} showChords transpose={0} />
    );

    expect(screen.getByText('para').tagName).toBe('EM');
    expect(screen.getByText('sempre').tagName).toBe('EM');
    expect(screen.getByText('sempre').parentElement?.tagName).toBe('STRONG');
    expect(screen.queryByText(/[*_]/u)).toBeNull();
  });

  it('limits the monospaced font to the chord line', () => {
    render(
      <HymnSection fontSize="md" isMusical section={formattedSection} showChords transpose={0} />
    );

    expect(screen.getByText('C').closest('.mantine-Text-root')).toHaveStyle({
      fontFamily: 'monospace',
    });
    expect(screen.getByText('para').closest('.mantine-Text-root')).toHaveStyle({
      fontFamily: 'inherit',
    });
  });

  it('preserves section-label brackets in the presentation', () => {
    render(
      <HymnSection
        fontSize="md"
        isMusical
        section={{ ...formattedSection, label: 'Refrão', type: 'chorus' }}
        showChords={false}
        transpose={0}
      />
    );

    expect(screen.getByText('[Refrão]')).toBeTruthy();
  });

  it('opens the persisted chord variation from an inline symbol', () => {
    localStorage.setItem(CHORD_VARIATIONS_STORAGE_KEY, JSON.stringify({ C: 1 }));
    render(
      <HymnSection
        diagramRenderer={new FakeChordDiagramRenderer()}
        fontSize="md"
        isMusical
        section={formattedSection}
        showChords
        transpose={0}
      />
    );

    fireEvent.mouseEnter(screen.getByRole('button', { name: 'Mostrar diagrama do acorde C' }));

    expect(screen.getByText('2/4')).toBeTruthy();
  });
});

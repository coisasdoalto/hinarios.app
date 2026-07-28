import { beforeEach, describe, expect, it } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react';
import { RenderableHymn } from '../../domain/hymn/renderableHymn.types';
import { HymnViewer } from './HymnViewer';

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
    render(<HymnViewer hymn={chordSheetHymn} />);

    fireEvent.click(screen.getByLabelText('Transpor um semitom acima'));

    expect(screen.getByText(/Tom atual: Ab/u)).toBeTruthy();
    expect(screen.getByText('Ab')).toBeTruthy();
    expect(chordSheetHymn.sections[0].lines[0].chords?.[0].symbol).toBe('G');
  });

  it('hides chords and transposition controls without losing transpose state', () => {
    render(<HymnViewer hymn={chordSheetHymn} />);
    fireEvent.click(screen.getByLabelText('Transpor um semitom acima'));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Cifras' }));

    expect(screen.queryByText(/Tom atual:/u)).toBeNull();
    expect(screen.queryByText('Ab')).toBeNull();

    fireEvent.click(screen.getByRole('checkbox', { name: 'Cifras' }));
    expect(screen.getByText(/Tom atual: Ab/u)).toBeTruthy();
  });

  it('keeps legacy hymns free of musical controls', () => {
    render(<HymnViewer hymn={{ ...chordSheetHymn, musical: undefined }} />);

    expect(screen.queryByRole('checkbox', { name: 'Cifras' })).toBeNull();
    expect(screen.getByText('Em espírito, em verdade')).toBeTruthy();
  });
});

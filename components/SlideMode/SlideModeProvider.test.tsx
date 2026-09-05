import { MantineProvider } from '@mantine/core';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { SlideModeProps } from './SlideMode';
import { HymnSlideMode, SlideModeProvider } from './SlideModeProvider';

jest.mock('../../hooks/useIsDesktopDevice', () => ({ useIsDesktopDevice: () => true }));
jest.mock('../../hooks/useSlidePopupPreference', () => ({
  useSlidePopupPreference: () => [true],
}));

const firstHymn: SlideModeProps = {
  hymnId: 'book/1',
  number: 1,
  title: 'Primeiro hino',
  lyrics: [
    { type: 'stanza', number: 1, text: 'Primeira estrofe' },
    { type: 'stanza', number: 2, text: 'Segunda estrofe' },
  ],
};

const nextHymn: SlideModeProps = {
  hymnId: 'book/2',
  number: 2,
  title: 'Outro hino',
  lyrics: [{ type: 'stanza', number: 1, text: 'Nova primeira estrofe' }],
};

function App({ hymn }: { hymn: SlideModeProps | null }) {
  return (
    <MantineProvider>
      <SlideModeProvider>
        {hymn ? <HymnSlideMode {...hymn} /> : <div>Lista de hinos</div>}
      </SlideModeProvider>
    </MantineProvider>
  );
}

describe('persistent slide popup', () => {
  let popup: Window;
  let popupDocument: Document;
  let closePopup: jest.Mock;

  beforeEach(() => {
    popupDocument = document.implementation.createHTMLDocument();
    closePopup = jest.fn();
    popup = {
      document: popupDocument,
      closed: false,
      close: closePopup,
      focus: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    } as unknown as Window;
    jest.spyOn(window, 'open').mockReturnValue(popup);
  });

  afterEach(() => jest.restoreAllMocks());

  it.each([false, true])(
    'keeps the same popup and resets the hymn after navigation (via list: %s)',
    (viaList) => {
      const view = render(<App hymn={firstHymn} />);
      fireEvent.click(screen.getByRole('button', { name: 'Abrir Modo Slide' }));
      fireEvent.keyDown(popupDocument, { key: 'ArrowRight' });
      expect(within(popupDocument.body).getByText('Segunda estrofe')).toBeInTheDocument();

      if (viaList) {
        view.rerender(<App hymn={null} />);
        expect(closePopup).not.toHaveBeenCalled();
        expect(within(popupDocument.body).getByText('Segunda estrofe')).toBeInTheDocument();
      }

      view.rerender(<App hymn={nextHymn} />);
      expect(closePopup).not.toHaveBeenCalled();
      expect(window.open).toHaveBeenCalledTimes(1);
      expect(within(popupDocument.body).getByText('2. Outro hino')).toBeInTheDocument();
      expect(within(popupDocument.body).getByText('Estrofe 1')).toBeInTheDocument();
      expect(within(popupDocument.body).getByText('Nova primeira estrofe')).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Abrir Modo Slide' }));
      expect(window.open).toHaveBeenCalledTimes(1);
      fireEvent.keyDown(popupDocument, { key: 'Escape' });
      expect(closePopup).toHaveBeenCalledTimes(1);
    }
  );

  it('does not open a popup just by selecting a hymn', () => {
    const view = render(<App hymn={firstHymn} />);
    view.rerender(<App hymn={nextHymn} />);
    expect(window.open).not.toHaveBeenCalled();
  });

  it('keeps main-window search shortcuts from controlling the popup', () => {
    render(<App hymn={firstHymn} />);
    fireEvent.click(screen.getByRole('button', { name: 'Abrir Modo Slide' }));
    fireEvent.keyDown(document, { key: 'ArrowRight' });
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(closePopup).not.toHaveBeenCalled();
    expect(within(popupDocument.body).getByText('Primeira estrofe')).toBeInTheDocument();
  });

  it('closes the popup when the application unmounts', () => {
    const view = render(<App hymn={firstHymn} />);
    fireEvent.click(screen.getByRole('button', { name: 'Abrir Modo Slide' }));
    view.unmount();
    expect(closePopup).toHaveBeenCalledTimes(1);
  });
});

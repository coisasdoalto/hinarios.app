import { beforeEach, describe, expect, it } from '@jest/globals';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

class FakeResizeObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

global.ResizeObserver = FakeResizeObserver;
import { HymnLyrics } from '../HymnLyrics';
import { useFontSizeStore } from '../Store/useFontSizeStore';
import HymnTextSize from './HymnTextSize';

function LyricsPreview({ layout }: { layout: 'normal' | 'grid' }) {
  const [fontSize] = useFontSizeStore();
  return (
    <HymnLyrics
      fontSize={fontSize}
      layout={layout}
      lyrics={[{ type: 'stanza', number: 1, text: 'Letra' }]}
    />
  );
}

describe('HymnTextSize', () => {
  beforeEach(() => localStorage.clear());

  it.each(['normal', 'grid'] as const)(
    'persists and applies sizes in %s layout',
    async (layout) => {
      render(
        <>
          <HymnTextSize />
          <LyricsPreview layout={layout} />
        </>
      );
      fireEvent.click(screen.getByLabelText('GG'));
      await waitFor(() => expect(localStorage.getItem('fontSize')).toBe('xxl'));
      expect(
        getComputedStyle(screen.getByText(/Letra/).parentElement as HTMLElement).fontSize
      ).toBe('40px');
    }
  );

  it.each([
    ['P', '16px'],
    ['M', '20px'],
    ['G', '24px'],
    ['GG', '40px'],
  ])('renders %s at %s', async (label, pixels) => {
    render(
      <>
        <HymnTextSize />
        <LyricsPreview layout="normal" />
      </>
    );
    fireEvent.click(screen.getByLabelText(label));
    await waitFor(() =>
      expect(
        getComputedStyle(screen.getByText(/Letra/).parentElement as HTMLElement).fontSize
      ).toBe(pixels)
    );
  });

  it('defaults to P for an invalid stored value', async () => {
    localStorage.setItem('fontSize', 'invalid');
    render(<HymnTextSize />);
    await waitFor(() =>
      expect((screen.getByLabelText('P') as HTMLInputElement).checked).toBe(true)
    );
  });

  it('restores a stored preference', async () => {
    localStorage.setItem('fontSize', 'xl');
    render(<HymnTextSize />);
    await waitFor(() =>
      expect((screen.getByLabelText('G') as HTMLInputElement).checked).toBe(true)
    );
  });
});

import { describe, expect, it } from '@jest/globals';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { ReactElement } from 'react';
import { AutoScrollViewport, useHymnAutoScroll } from './useHymnAutoScroll';

class FakeAutoScrollViewport implements AutoScrollViewport {
  cancelledFrameIds: number[] = [];
  maximumScrollTop = 100;
  requestedFrames = new Map<number, FrameRequestCallback>();
  scrollTop = 0;
  private nextFrameId = 1;

  cancelFrame(frameId: number): void {
    this.cancelledFrameIds.push(frameId);
    this.requestedFrames.delete(frameId);
  }

  getMaximumScrollTop(): number {
    return this.maximumScrollTop;
  }

  getScrollTop(): number {
    return this.scrollTop;
  }

  requestFrame(callback: FrameRequestCallback): number {
    const frameId = this.nextFrameId;
    this.nextFrameId += 1;
    this.requestedFrames.set(frameId, callback);
    return frameId;
  }

  runNextFrame(timestamp: number): void {
    const frameEntry = this.requestedFrames.entries().next().value;
    if (!frameEntry) throw new Error('Missing animation frame; expected one scheduled callback');

    const [frameId, callback] = frameEntry;
    this.requestedFrames.delete(frameId);
    callback(timestamp);
  }

  scrollTo(scrollTop: number): void {
    this.scrollTop = scrollTop;
  }
}

function AutoScrollHarness({
  hymnId,
  viewport,
}: {
  hymnId: string;
  viewport: AutoScrollViewport;
}): ReactElement {
  const autoScroll = useHymnAutoScroll(hymnId, viewport);

  return (
    <>
      <span>{autoScroll.paused ? 'Pausado' : 'Executando'}</span>
      <button type="button" onClick={() => autoScroll.setEnabled(true)}>
        Iniciar
      </button>
      <button type="button" onClick={autoScroll.pause}>
        Pausar
      </button>
      <button type="button" onClick={() => autoScroll.setSpeed('fast')}>
        Rápido
      </button>
    </>
  );
}

describe('useHymnAutoScroll', () => {
  it('advances the viewport according to the selected speed', () => {
    const viewport = new FakeAutoScrollViewport();
    render(<AutoScrollHarness hymnId="hymn-1" viewport={viewport} />);
    fireEvent.click(screen.getByRole('button', { name: 'Rápido' }));
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar' }));

    act(() => viewport.runNextFrame(0));
    act(() => viewport.runNextFrame(1000));

    expect(viewport.scrollTop).toBeCloseTo(4.8);
  });

  it('pauses when requested and when the end is reached', () => {
    const viewport = new FakeAutoScrollViewport();
    viewport.maximumScrollTop = 2;
    render(<AutoScrollHarness hymnId="hymn-1" viewport={viewport} />);
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Pausar' }));
    expect(screen.getByText('Pausado')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Iniciar' }));
    act(() => viewport.runNextFrame(0));
    act(() => viewport.runNextFrame(1000));
    expect(screen.getByText('Pausado')).toBeTruthy();
  });

  it('stops and returns to the top when the hymn changes', () => {
    const viewport = new FakeAutoScrollViewport();
    const harness = render(<AutoScrollHarness hymnId="hymn-1" viewport={viewport} />);
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar' }));
    viewport.scrollTop = 80;

    harness.rerender(<AutoScrollHarness hymnId="hymn-2" viewport={viewport} />);

    expect(viewport.scrollTop).toBe(0);
    expect(viewport.requestedFrames.size).toBe(0);
  });
});

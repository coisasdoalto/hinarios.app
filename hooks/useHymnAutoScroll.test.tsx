import { describe, expect, it } from '@jest/globals';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { ReactElement } from 'react';
import { AutoScrollViewport, useHymnAutoScroll } from './useHymnAutoScroll';

class FakeAutoScrollViewport implements AutoScrollViewport {
  cancelledFrameIds: number[] = [];
  integerScrollPositions = false;
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
    this.scrollTop = this.integerScrollPositions ? Math.floor(scrollTop) : scrollTop;
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
      <button type="button" onClick={autoScroll.togglePaused}>
        Alternar pausa
      </button>
      <button type="button" onClick={() => autoScroll.setSpeed(20)}>
        Velocidade máxima
      </button>
      <button type="button" onClick={() => autoScroll.setSpeed(1)}>
        Velocidade mínima
      </button>
    </>
  );
}

describe('useHymnAutoScroll', () => {
  it('advances the viewport according to the selected speed', () => {
    const viewport = new FakeAutoScrollViewport();
    render(<AutoScrollHarness hymnId="hymn-1" viewport={viewport} />);
    fireEvent.click(screen.getByRole('button', { name: 'Velocidade máxima' }));
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar' }));

    act(() => viewport.runNextFrame(0));
    act(() => viewport.runNextFrame(1000));

    expect(viewport.scrollTop).toBeCloseTo(8);
  });

  it('uses a visible pace at the default desktop speed', () => {
    const viewport = new FakeAutoScrollViewport();
    render(<AutoScrollHarness hymnId="hymn-1" viewport={viewport} />);
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar' }));

    act(() => viewport.runNextFrame(0));
    act(() => viewport.runNextFrame(100));
    act(() => viewport.runNextFrame(200));

    expect(viewport.scrollTop).toBe(3);
  });

  it('accumulates subpixels when the viewport only accepts integer positions', () => {
    const viewport = new FakeAutoScrollViewport();
    viewport.integerScrollPositions = true;
    render(<AutoScrollHarness hymnId="hymn-1" viewport={viewport} />);
    fireEvent.click(screen.getByRole('button', { name: 'Velocidade mínima' }));
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar' }));

    for (let frame = 0; frame <= 10; frame += 1) {
      act(() => viewport.runNextFrame(frame * (1000 / 60)));
    }

    expect(viewport.scrollTop).toBe(2);
  });

  it('pauses when requested and when the end is reached', () => {
    const viewport = new FakeAutoScrollViewport();
    viewport.maximumScrollTop = 0.5;
    render(<AutoScrollHarness hymnId="hymn-1" viewport={viewport} />);
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Alternar pausa' }));
    expect(screen.getByText('Pausado')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Iniciar' }));
    act(() => viewport.runNextFrame(0));
    act(() => viewport.runNextFrame(1000));
    expect(screen.getByText('Pausado')).toBeTruthy();
  });

  it('keeps running after the person scrolls manually', () => {
    const viewport = new FakeAutoScrollViewport();
    render(<AutoScrollHarness hymnId="hymn-1" viewport={viewport} />);
    fireEvent.click(screen.getByRole('button', { name: 'Velocidade máxima' }));
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar' }));

    act(() => viewport.runNextFrame(0));
    viewport.scrollTop = 40;
    act(() => viewport.runNextFrame(100));

    expect(viewport.scrollTop).toBeCloseTo(48);
    expect(screen.getByText('Executando')).toBeTruthy();
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

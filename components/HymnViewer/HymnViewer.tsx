import { Box, MantineSize } from '@mantine/core';
import { ReactElement, useEffect, useState } from 'react';
import { ChordDiagramRenderer } from '../../chord-diagrams/chordDiagram.types';
import { transposeChordSymbol } from '../../chord-sheets/transposeChordSheet';
import { RenderableHymn } from '../../domain/hymn/renderableHymn.types';
import {
  AutoScrollViewport,
  HymnAutoScrollState,
  useHymnAutoScroll,
} from '../../hooks/useHymnAutoScroll';
import { ChordDiagramStrip } from './ChordDiagramStrip';
import { HymnControls } from './HymnControls';
import { HymnSection } from './HymnSection';

const DEFAULT_FONT_SIZE: MantineSize = 'md';

type HymnViewerState = {
  autoScroll: HymnAutoScrollState;
  fontSize: MantineSize;
  setFontSize: (fontSize: MantineSize) => void;
  setTranspose: (transpose: number) => void;
  transpose: number;
};

type HymnViewerProps = {
  autoScrollViewport?: AutoScrollViewport;
  diagramRenderer?: ChordDiagramRenderer;
  hymn: RenderableHymn;
  onAutoScrollEnabledChange?: (enabled: boolean) => void;
  showChords: boolean;
};

type ViewerContentProps = {
  diagramRenderer?: ChordDiagramRenderer;
  hymn: RenderableHymn;
  showChords: boolean;
  viewerState: HymnViewerState;
};

function isViewerFontSize(fontSize: string): fontSize is MantineSize {
  return /^(md|lg|xl)$/u.test(fontSize);
}

function useViewerFontSize(): [MantineSize, (fontSize: MantineSize) => void] {
  const [fontSize, setFontSize] = useState<MantineSize>(DEFAULT_FONT_SIZE);

  useEffect(() => {
    const savedFontSize = localStorage.getItem('fontSize') ?? '';
    if (isViewerFontSize(savedFontSize)) setFontSize(savedFontSize);
  }, []);
  useEffect(() => localStorage.setItem('fontSize', fontSize), [fontSize]);

  return [fontSize, setFontSize];
}

function useHymnViewerState(
  hymnId: string,
  autoScrollViewport?: AutoScrollViewport
): HymnViewerState {
  const autoScroll = useHymnAutoScroll(hymnId, autoScrollViewport);
  const [fontSize, setFontSize] = useViewerFontSize();
  const [transpose, setTranspose] = useState(0);

  useEffect(() => {
    setTranspose(0);
  }, [hymnId]);

  return { autoScroll, fontSize, setFontSize, setTranspose, transpose };
}

function useNotifyAutoScrollEnabled(
  enabled: boolean,
  onEnabledChange?: (enabled: boolean) => void
): void {
  useEffect(() => onEnabledChange?.(enabled), [enabled, onEnabledChange]);
}

function useDisableAutoScrollWithoutChords(
  showChords: boolean,
  setEnabled: (enabled: boolean) => void
): void {
  useEffect(() => {
    if (!showChords) setEnabled(false);
  }, [setEnabled, showChords]);
}

function resolveCurrentKey(hymn: RenderableHymn, transpose: number): string | undefined {
  const originalKey = hymn.musical?.originalKey;
  return originalKey ? transposeChordSymbol(originalKey, transpose) : undefined;
}

function ViewerControls({ hymn, showChords, viewerState }: ViewerContentProps): ReactElement {
  return (
    <HymnControls
      autoScroll={{
        enabled: viewerState.autoScroll.enabled,
        onEnabledChange: viewerState.autoScroll.setEnabled,
        onPausedChange: viewerState.autoScroll.togglePaused,
        onSpeedChange: viewerState.autoScroll.setSpeed,
        paused: viewerState.autoScroll.paused,
        speed: viewerState.autoScroll.speed,
      }}
      currentKey={resolveCurrentKey(hymn, viewerState.transpose)}
      fontSize={viewerState.fontSize}
      isMusical={Boolean(hymn.musical)}
      originalKey={hymn.musical?.originalKey}
      onFontSizeChange={viewerState.setFontSize}
      onTransposeChange={viewerState.setTranspose}
      showChords={showChords}
      transpose={viewerState.transpose}
    />
  );
}

function ViewerSections({
  diagramRenderer,
  hymn,
  showChords,
  viewerState,
}: ViewerContentProps): ReactElement {
  return (
    <Box>
      {hymn.sections.map((section) => (
        <HymnSection
          key={section.id}
          diagramRenderer={diagramRenderer}
          fontSize={viewerState.fontSize}
          isMusical={Boolean(hymn.musical)}
          section={section}
          showChords={showChords}
          transpose={viewerState.transpose}
        />
      ))}
    </Box>
  );
}

/**
 * Presents any normalized hymn while keeping musical preferences local to the viewer.
 *
 * @example <HymnViewer hymn={normalizedHymn} showChords />
 */
export function HymnViewer({
  autoScrollViewport,
  diagramRenderer,
  hymn,
  onAutoScrollEnabledChange,
  showChords,
}: HymnViewerProps): ReactElement {
  const viewerState = useHymnViewerState(hymn.id, autoScrollViewport);
  useDisableAutoScrollWithoutChords(showChords, viewerState.autoScroll.setEnabled);
  useNotifyAutoScrollEnabled(viewerState.autoScroll.enabled, onAutoScrollEnabledChange);

  return (
    <Box>
      <ViewerControls hymn={hymn} showChords={showChords} viewerState={viewerState} />
      {hymn.musical && showChords && (
        <ChordDiagramStrip
          hymn={hymn}
          renderer={diagramRenderer}
          transpose={viewerState.transpose}
        />
      )}
      <ViewerSections
        diagramRenderer={diagramRenderer}
        hymn={hymn}
        showChords={showChords}
        viewerState={viewerState}
      />
    </Box>
  );
}

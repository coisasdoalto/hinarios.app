import { Box, MantineSize } from '@mantine/core';
import { useEffect, useState } from 'react';
import { transposeChordSymbol } from '../../chord-sheets/transposeChordSheet';
import { RenderableHymn } from '../../domain/hymn/renderableHymn.types';
import { HymnControls } from './HymnControls';
import { HymnSection } from './HymnSection';

const DEFAULT_FONT_SIZE: MantineSize = 'md';

type HymnViewerState = {
  fontSize: MantineSize;
  setFontSize: (fontSize: MantineSize) => void;
  setShowChords: (showChords: boolean) => void;
  setTranspose: (transpose: number) => void;
  showChords: boolean;
  transpose: number;
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

function useHymnViewerState(hymnId: string): HymnViewerState {
  const [fontSize, setFontSize] = useViewerFontSize();
  const [showChords, setShowChords] = useState(true);
  const [transpose, setTranspose] = useState(0);

  useEffect(() => {
    setShowChords(true);
    setTranspose(0);
  }, [hymnId]);

  return { fontSize, setFontSize, setShowChords, setTranspose, showChords, transpose };
}

function resolveCurrentKey(hymn: RenderableHymn, transpose: number): string | undefined {
  const originalKey = hymn.musical?.originalKey;
  return originalKey ? transposeChordSymbol(originalKey, transpose) : undefined;
}

function ViewerControls({
  hymn,
  viewerState,
}: {
  hymn: RenderableHymn;
  viewerState: HymnViewerState;
}) {
  return (
    <HymnControls
      currentKey={resolveCurrentKey(hymn, viewerState.transpose)}
      fontSize={viewerState.fontSize}
      isMusical={Boolean(hymn.musical)}
      onFontSizeChange={viewerState.setFontSize}
      onShowChordsChange={viewerState.setShowChords}
      onTransposeChange={viewerState.setTranspose}
      showChords={viewerState.showChords}
      transpose={viewerState.transpose}
    />
  );
}

function ViewerSections({
  hymn,
  viewerState,
}: {
  hymn: RenderableHymn;
  viewerState: HymnViewerState;
}) {
  return (
    <>
      {hymn.sections.map((section) => (
        <HymnSection
          key={section.id}
          fontSize={viewerState.fontSize}
          isMusical={Boolean(hymn.musical)}
          section={section}
          showChords={viewerState.showChords}
          transpose={viewerState.transpose}
        />
      ))}
    </>
  );
}

/**
 * Presents any normalized hymn while keeping musical preferences local to the viewer.
 *
 * @example <HymnViewer hymn={normalizeHymn({ hymn, hymnBookSlug })} />
 */
export function HymnViewer({ hymn }: { hymn: RenderableHymn }) {
  const viewerState = useHymnViewerState(hymn.id);

  return (
    <Box>
      <ViewerControls hymn={hymn} viewerState={viewerState} />
      <ViewerSections hymn={hymn} viewerState={viewerState} />
    </Box>
  );
}

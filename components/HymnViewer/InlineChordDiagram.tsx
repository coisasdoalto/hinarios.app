import { Popover, UnstyledButton } from '@mantine/core';
import { forwardRef, ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import { ChordDiagramRenderer } from '../../chord-diagrams/chordDiagram.types';
import { ChordDiagram } from './ChordDiagram';

const HOVER_CLOSE_DELAY = 120;

type InlineChordDiagramProps = {
  onVariationChange: (variationIndex: number) => void;
  renderer?: ChordDiagramRenderer;
  symbol: string;
  variationIndex: number;
};

type ChordPopoverState = {
  cancelClose: () => void;
  closeAfterDelay: () => void;
  open: () => void;
  opened: boolean;
  setOpened: (opened: boolean) => void;
};

function useChordPopover(): ChordPopoverState {
  const [opened, setOpened] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>();
  const cancelClose = useCallback(() => {
    if (!closeTimer.current) return;
    clearTimeout(closeTimer.current);
    closeTimer.current = undefined;
  }, []);
  const open = useCallback(() => {
    cancelClose();
    setOpened(true);
  }, [cancelClose]);
  const closeAfterDelay = useCallback(() => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpened(false), HOVER_CLOSE_DELAY);
  }, [cancelClose]);

  useEffect(() => () => cancelClose(), [cancelClose]);
  return { cancelClose, closeAfterDelay, open, opened, setOpened };
}

type ChordDiagramTriggerProps = {
  popover: ChordPopoverState;
  symbol: string;
};

const ChordDiagramTrigger = forwardRef<HTMLButtonElement, ChordDiagramTriggerProps>(
  function ChordDiagramTrigger({ popover, symbol }, ref): ReactElement {
    return (
      <UnstyledButton
        ref={ref}
        aria-label={`Mostrar diagrama do acorde ${symbol}`}
        onBlur={popover.closeAfterDelay}
        onClick={popover.open}
        onFocus={popover.open}
        onMouseEnter={popover.open}
        onMouseLeave={popover.closeAfterDelay}
        sx={{ color: 'inherit', font: 'inherit', lineHeight: 'inherit', verticalAlign: 'baseline' }}
        type="button"
      >
        {symbol}
      </UnstyledButton>
    );
  }
);

function ChordDiagramDropdown(
  props: InlineChordDiagramProps & { popover: ChordPopoverState }
): ReactElement {
  const { popover, ...diagramProps } = props;
  return (
    <Popover.Dropdown
      onBlur={popover.closeAfterDelay}
      onFocus={popover.open}
      onMouseEnter={popover.cancelClose}
      onMouseLeave={popover.closeAfterDelay}
    >
      <ChordDiagram {...diagramProps} />
    </Popover.Dropdown>
  );
}

/**
 * Opens a persisted guitar chord diagram from an inline chord symbol.
 *
 * @example <InlineChordDiagram symbol="G" variationIndex={0} onVariationChange={select} />
 */
export function InlineChordDiagram({
  onVariationChange,
  renderer,
  symbol,
  variationIndex,
}: InlineChordDiagramProps): ReactElement {
  const popover = useChordPopover();

  return (
    <Popover
      onChange={popover.setOpened}
      opened={popover.opened}
      position="top"
      shadow="md"
      withinPortal
      withArrow
    >
      <Popover.Target>
        <ChordDiagramTrigger popover={popover} symbol={symbol} />
      </Popover.Target>
      <ChordDiagramDropdown
        onVariationChange={onVariationChange}
        popover={popover}
        renderer={renderer}
        symbol={symbol}
        variationIndex={variationIndex}
      />
    </Popover>
  );
}

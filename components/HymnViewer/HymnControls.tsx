import { Button, Group, MantineSize, SegmentedControl, Stack, Switch, Text } from '@mantine/core';
import { IconArrowDown, IconArrowUp } from '@tabler/icons-react';
import { ReactElement, ReactNode } from 'react';
import { AutoScrollControls, AutoScrollControlsProps } from './AutoScrollControls';

type HymnControlsProps = {
  autoScroll: AutoScrollControlsProps;
  currentKey?: string;
  fontSize: MantineSize;
  isMusical: boolean;
  originalKey?: string;
  showChords: boolean;
  showChordDiagrams: boolean;
  transpose: number;
  onFontSizeChange: (fontSize: MantineSize) => void;
  onTransposeChange: (transpose: number) => void;
  onShowChordDiagramsChange: (show: boolean) => void;
};

const FONT_SIZE_OPTIONS = [
  { label: 'Pequeno', value: 'md' },
  { label: 'Médio', value: 'lg' },
  { label: 'Grande', value: 'xl' },
];

type ChordControlsProps = Pick<
  HymnControlsProps,
  'currentKey' | 'originalKey' | 'showChords' | 'transpose' | 'onTransposeChange'
>;

function TransposeButton({
  children,
  disabled,
  label,
  onClick,
}: {
  children: ReactNode;
  disabled?: boolean;
  label: string;
  onClick: () => void;
}): ReactElement {
  return (
    <Button aria-label={label} compact disabled={disabled} onClick={onClick} variant="default">
      {children}
    </Button>
  );
}

function TransposeControls(props: ChordControlsProps): ReactElement {
  const { currentKey, originalKey, transpose, onTransposeChange } = props;

  return (
    <Group position="center" spacing="xs">
      {originalKey && <Text size="sm">Tom original: {originalKey}</Text>}
      <Button.Group>
        <TransposeButton
          disabled={transpose <= -11}
          label="Transpor um semitom abaixo"
          onClick={() => onTransposeChange(transpose - 1)}
        >
          <IconArrowDown size="1rem" />
        </TransposeButton>
        <TransposeButton label="Restaurar tom original" onClick={() => onTransposeChange(0)}>
          {currentKey ?? '—'}
        </TransposeButton>
        <TransposeButton
          disabled={transpose >= 11}
          label="Transpor um semitom acima"
          onClick={() => onTransposeChange(transpose + 1)}
        >
          <IconArrowUp size="1rem" />
        </TransposeButton>
      </Button.Group>
    </Group>
  );
}

function ChordControls(props: ChordControlsProps): ReactElement | null {
  if (props.showChords) return <TransposeControls {...props} />;
  if (!props.originalKey) return null;

  return <Text size="sm">Tom original: {props.originalKey}</Text>;
}

function FontSizeControl(
  props: Pick<HymnControlsProps, 'fontSize' | 'onFontSizeChange'>
): ReactElement {
  return (
    <SegmentedControl
      data={FONT_SIZE_OPTIONS}
      onChange={(value) => props.onFontSizeChange(value as MantineSize)}
      value={props.fontSize}
    />
  );
}

/**
 * Renders viewer-only controls without mutating the canonical hymn source.
 *
 * @example <HymnControls {...viewerControlProps} />
 */
export function HymnControls(props: HymnControlsProps): ReactElement {
  return (
    <Stack align="center" spacing="xs">
      <FontSizeControl {...props} />
      {props.isMusical && props.showChords && (
        <Switch
          checked={props.showChordDiagrams}
          label="Mostrar imagens dos acordes"
          onChange={(event) => props.onShowChordDiagramsChange(event.currentTarget.checked)}
        />
      )}
      {props.isMusical && <ChordControls {...props} />}
      {props.isMusical && props.showChords && <AutoScrollControls {...props.autoScroll} />}
    </Stack>
  );
}

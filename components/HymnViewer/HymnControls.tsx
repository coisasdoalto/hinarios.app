import { Button, Group, MantineSize, SegmentedControl, Stack, Text } from '@mantine/core';
import { ReactElement, ReactNode } from 'react';
import { AutoScrollControls, AutoScrollControlsProps } from './AutoScrollControls';

type HymnControlsProps = {
  autoScroll: AutoScrollControlsProps;
  currentKey?: string;
  fontSize: MantineSize;
  isMusical: boolean;
  originalKey?: string;
  showChords: boolean;
  transpose: number;
  onFontSizeChange: (fontSize: MantineSize) => void;
  onTransposeChange: (transpose: number) => void;
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
      {currentKey && <Text size="sm">Tom atual: {currentKey}</Text>}
      <TransposeButton
        disabled={transpose <= -11}
        label="Transpor um semitom abaixo"
        onClick={() => onTransposeChange(transpose - 1)}
      >
        −
      </TransposeButton>
      <TransposeButton label="Restaurar tom original" onClick={() => onTransposeChange(0)}>
        {transpose}
      </TransposeButton>
      <TransposeButton
        disabled={transpose >= 11}
        label="Transpor um semitom acima"
        onClick={() => onTransposeChange(transpose + 1)}
      >
        +
      </TransposeButton>
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
      {props.isMusical && <ChordControls {...props} />}
      <AutoScrollControls {...props.autoScroll} />
    </Stack>
  );
}

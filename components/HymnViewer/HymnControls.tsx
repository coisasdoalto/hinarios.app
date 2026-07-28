import { Box, Button, Group, MantineSize, SegmentedControl, Switch, Text } from '@mantine/core';

type HymnControlsProps = {
  currentKey?: string;
  fontSize: MantineSize;
  isMusical: boolean;
  showChords: boolean;
  transpose: number;
  onFontSizeChange: (fontSize: MantineSize) => void;
  onShowChordsChange: (showChords: boolean) => void;
  onTransposeChange: (transpose: number) => void;
};

const FONT_SIZE_OPTIONS = [
  { label: 'Pequeno', value: 'md' },
  { label: 'Médio', value: 'lg' },
  { label: 'Grande', value: 'xl' },
];

type ChordControlsProps = Pick<
  HymnControlsProps,
  'currentKey' | 'showChords' | 'transpose' | 'onShowChordsChange' | 'onTransposeChange'
>;

function TransposeButton({
  children,
  disabled,
  label,
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button aria-label={label} compact disabled={disabled} onClick={onClick} variant="default">
      {children}
    </Button>
  );
}

function TransposeControls(props: ChordControlsProps) {
  const { currentKey, transpose, onTransposeChange } = props;

  return (
    <Group mt="xs" spacing="xs">
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

function ChordControls(props: ChordControlsProps) {
  return (
    <Box>
      <Switch
        checked={props.showChords}
        label="Cifras"
        onChange={(event) => props.onShowChordsChange(event.currentTarget.checked)}
      />
      {props.showChords && <TransposeControls {...props} />}
    </Box>
  );
}

function FontSizeControl(props: Pick<HymnControlsProps, 'fontSize' | 'onFontSizeChange'>) {
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
export function HymnControls(props: HymnControlsProps) {
  return (
    <Group position="center" spacing="lg">
      <FontSizeControl {...props} />
      {props.isMusical && <ChordControls {...props} />}
    </Group>
  );
}

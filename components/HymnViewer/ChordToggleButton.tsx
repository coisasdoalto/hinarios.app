import { ActionIcon, Tooltip } from '@mantine/core';
import { IconGuitarPick } from '@tabler/icons-react';
import { ReactElement } from 'react';

type ChordToggleButtonProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
};

/**
 * Toggles chord-sheet presentation from the hymn action bar.
 *
 * @example <ChordToggleButton checked onChange={setShowChords} />
 */
export function ChordToggleButton({ checked, onChange }: ChordToggleButtonProps): ReactElement {
  const label = checked ? 'Ocultar cifras' : 'Mostrar cifras';

  return (
    <Tooltip label={label}>
      <ActionIcon
        aria-label={label}
        aria-pressed={checked}
        color={checked ? 'blue' : 'gray'}
        onClick={() => onChange(!checked)}
        size="lg"
        variant={checked ? 'light' : 'subtle'}
      >
        <IconGuitarPick stroke={1.5} />
      </ActionIcon>
    </Tooltip>
  );
}

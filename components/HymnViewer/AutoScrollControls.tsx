import { Button, Group, SegmentedControl, Switch } from '@mantine/core';
import { ReactElement } from 'react';
import { AutoScrollSpeed } from '../../hooks/useHymnAutoScroll';

export type AutoScrollControlsProps = {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  onPausedChange: () => void;
  onSpeedChange: (speed: AutoScrollSpeed) => void;
  paused: boolean;
  speed: AutoScrollSpeed;
};

const SPEED_OPTIONS = [
  { label: 'Lenta', value: 'slow' },
  { label: 'Normal', value: 'medium' },
  { label: 'Rápida', value: 'fast' },
];

function isAutoScrollSpeed(speed: string): speed is AutoScrollSpeed {
  return /^(slow|medium|fast)$/u.test(speed);
}

/**
 * Renders presentation-only controls for automatic hymn scrolling.
 *
 * @example <AutoScrollControls {...autoScrollControlProps} />
 */
export function AutoScrollControls(props: AutoScrollControlsProps): ReactElement {
  function changeSpeed(speed: string): void {
    if (isAutoScrollSpeed(speed)) props.onSpeedChange(speed);
  }

  return (
    <Group position="center" spacing="xs">
      <Switch
        checked={props.enabled}
        label="Rolagem automática"
        onChange={(event) => props.onEnabledChange(event.currentTarget.checked)}
      />
      <SegmentedControl
        aria-label="Velocidade da rolagem automática"
        data={SPEED_OPTIONS}
        onChange={changeSpeed}
        size="xs"
        value={props.speed}
      />
      {props.enabled && (
        <Button compact onClick={props.onPausedChange} variant="default">
          {props.paused ? 'Retomar' : 'Pausar'}
        </Button>
      )}
    </Group>
  );
}

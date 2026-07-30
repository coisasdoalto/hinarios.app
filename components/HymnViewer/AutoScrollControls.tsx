import {
  ActionIcon,
  Affix,
  Group,
  MediaQuery,
  Paper,
  Slider,
  Switch,
  Text,
  Tooltip,
} from '@mantine/core';
import { IconPlayerPause, IconPlayerPlay } from '@tabler/icons-react';
import { ReactElement } from 'react';
import {
  AUTO_SCROLL_MAXIMUM_SPEED,
  AUTO_SCROLL_MINIMUM_SPEED,
  AutoScrollSpeed,
} from '../../hooks/useHymnAutoScroll';

export type AutoScrollControlsProps = {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  onPausedChange: () => void;
  onSpeedChange: (speed: AutoScrollSpeed) => void;
  paused: boolean;
  speed: AutoScrollSpeed;
};

function AutoScrollSpeedSlider(props: AutoScrollControlsProps): ReactElement {
  return (
    <Group spacing="xs" noWrap>
      <Text size="sm">Velocidade</Text>
      <Slider
        min={AUTO_SCROLL_MINIMUM_SPEED}
        max={AUTO_SCROLL_MAXIMUM_SPEED}
        onChange={props.onSpeedChange}
        step={1}
        thumbLabel="Velocidade da rolagem automática"
        value={props.speed}
        sx={{ width: 180 }}
      />
    </Group>
  );
}

function PauseActionButton(props: AutoScrollControlsProps): ReactElement {
  const label = props.paused ? 'Retomar rolagem automática' : 'Pausar rolagem automática';
  return (
    <Tooltip label={label}>
      <ActionIcon aria-label={label} onClick={props.onPausedChange} size="md" variant="default">
        {props.paused ? <IconPlayerPlay size="1rem" /> : <IconPlayerPause size="1rem" />}
      </ActionIcon>
    </Tooltip>
  );
}

function AutoScrollSettings(props: AutoScrollControlsProps): ReactElement {
  return (
    <Paper p="xs" radius="sm" shadow="sm" withBorder>
      <Group noWrap spacing="xs">
        <AutoScrollSpeedSlider {...props} />
        <PauseActionButton {...props} />
      </Group>
    </Paper>
  );
}

function MobilePauseButton(props: AutoScrollControlsProps): ReactElement {
  const label = props.paused ? 'Retomar rolagem automática' : 'Pausar rolagem automática';
  const icon = props.paused ? <IconPlayerPlay /> : <IconPlayerPause />;

  return (
    <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
      <Affix position={{ bottom: 24, right: 16 }} zIndex={4}>
        <Tooltip label={label}>
          <ActionIcon
            aria-label={label}
            color="blue"
            onClick={props.onPausedChange}
            radius="xl"
            size={56}
            variant="filled"
          >
            {icon}
          </ActionIcon>
        </Tooltip>
      </Affix>
    </MediaQuery>
  );
}

/**
 * Renders presentation-only controls for automatic hymn scrolling.
 *
 * @example <AutoScrollControls {...autoScrollControlProps} />
 */
export function AutoScrollControls(props: AutoScrollControlsProps): ReactElement {
  return (
    <>
      <Group position="center" spacing="xs">
        <Switch
          checked={props.enabled}
          label="Rolagem automática"
          onChange={(event) => props.onEnabledChange(event.currentTarget.checked)}
        />
        {props.enabled && <AutoScrollSettings {...props} />}
      </Group>
      {props.enabled && <MobilePauseButton {...props} />}
    </>
  );
}

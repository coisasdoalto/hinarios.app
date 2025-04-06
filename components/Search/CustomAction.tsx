import { SpotlightActionProps } from '@mantine/spotlight';

import useStyles from './CustomAction.styles';
import { UnstyledButton, Group, Center, Badge, Text, Image } from '@mantine/core';
import { composeDescription } from './composeDescription';

export function CustomAction({
  action,
  styles,
  classNames,
  hovered,
  onTrigger,
  ...others
}: SpotlightActionProps) {
  const { classes, cx } = useStyles(undefined, { styles, classNames, name: 'Spotlight' });

  const description = composeDescription(action.description || '');

  return (
    <UnstyledButton
      className={cx(classes.action, { [classes.actionHovered]: hovered })}
      tabIndex={-1}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onTrigger}
      {...others}
    >
      <Group noWrap>
        {action.image && (
          <Center>
            <Image src={action.image} alt={action.title} width={50} height={50} />
          </Center>
        )}

        <div style={{ flex: 1, overflow: 'hidden' }}>
          <Text>{action.title}</Text>

          {action.description && (
            <Text
              color="dimmed"
              size="xs"
              style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {description}
            </Text>
          )}
        </div>

        {action.new && <Badge>new</Badge>}
      </Group>
    </UnstyledButton>
  );
}

import { createStyles } from '@mantine/core';

export default createStyles((theme) => ({
  action: {
    position: 'relative',
    display: 'block',
    width: '100%',
    padding: '10px 12px',
    borderRadius: theme.radius.sm,
  },

  actionHovered: {
    backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[1],
  },
}));

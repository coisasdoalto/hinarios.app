import { Alert, Button, Center, Stack } from '@mantine/core';
import Link from 'next/link';

import { HC_UNAVAILABLE_ALERT_TITLE, HC_UNAVAILABLE_MESSAGE } from '../../contants';

/**
 * Displays the access message for a hymn book unavailable to the current user.
 * @example <HymnBookUnavailable />
 */
export function HymnBookUnavailable() {
  return (
    <Center style={{ minHeight: '60vh', width: '100%' }} px="md">
      <Stack align="center" spacing="md" style={{ width: '100%', maxWidth: 520 }}>
        <Alert
          title={HC_UNAVAILABLE_ALERT_TITLE}
          color="blue"
          style={{ width: '100%', textAlign: 'center' }}
        >
          {HC_UNAVAILABLE_MESSAGE}
        </Alert>

        <Button component={Link} href="/">
          Voltar para a home
        </Button>
      </Stack>
    </Center>
  );
}

import { Button, Notification, Text } from '@mantine/core';
import { useEffect, useState } from 'react';
import { startServiceWorkerUpdates } from '../../utils/serviceWorkerUpdates';

export function PwaUpdateNotification() {
  const [updateReady, setUpdateReady] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    return startServiceWorkerUpdates(
      () => setUpdateReady(true),
      process.env.NEXT_PUBLIC_APP_BUILD_ID
    );
  }, []);

  if (!updateReady) return null;

  return (
    <Notification
      title="Nova versão disponível"
      onClose={() => setUpdateReady(false)}
      role="status"
      sx={{
        position: 'fixed',
        bottom: 80,
        right: 16,
        width: 'min(340px, calc(100vw - 32px))',
        zIndex: 200,
      }}
    >
      <Text size="sm">Atualize quando for conveniente. A página será recarregada.</Text>
      <Button mt="sm" size="xs" onClick={() => window.location.reload()}>
        Atualizar
      </Button>
    </Notification>
  );
}

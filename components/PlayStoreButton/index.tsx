import { Anchor, Center, Container } from '@mantine/core';

import { useInstalledApp } from 'hooks/useInstalledApp';

export function PlayStoreButton() {
  const isAppInstalled = useInstalledApp();

  if (isAppInstalled) return null;

  return (
    <Container size="xs" mt="xl">
      <Center mb="md">
        <Anchor
          target="_blank"
          rel="noopener noreferrer"
          href="https://play.google.com/store/apps/details?id=app.hinarios.twa"
          title="Baixar no Google Play"
        >
          <img
            alt="Disponível no Google Play"
            src="https://play.google.com/intl/en_us/badges/static/images/badges/pt_badge_web_generic.png"
            height={64}
          />
        </Anchor>
      </Center>
    </Container>
  );
}

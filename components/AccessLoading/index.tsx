import { Center, Loader } from '@mantine/core';

/**
 * Displays a centered loading state while application permissions are resolved.
 * @example <AccessLoading />
 */
export function AccessLoading() {
  return (
    <Center style={{ minHeight: '60vh', width: '100%' }}>
      <Loader aria-label="Carregando permissões" />
    </Center>
  );
}

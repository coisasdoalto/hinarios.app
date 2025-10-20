import { ActionIcon, Avatar, Button, Menu as MantineMenu } from '@mantine/core';
import { IconLogout } from '@tabler/icons';
import { useFeatureFlagEnabled } from 'posthog-js/react';
import { signInWithGoogle, signOut } from '../../firebase/web/auth';
import { useUser } from '../../hooks/useUser';

function LoginMenu() {
  const {user, isLoading} = useUser();

  const isLoginEnabled = useFeatureFlagEnabled('login');

  if (!isLoginEnabled || isLoading) {
    return null;
  }

  if (!user) {
    return (
      <Button variant="outline" color="gray" onClick={() => signInWithGoogle()} size="xs">
        Entrar
      </Button>
    );
  }

  return (
    <MantineMenu shadow="md" width={200}>
      <MantineMenu.Target>
        <ActionIcon size="md">
          <Avatar
            src={user?.photoURL}
            size={24}
            title={user?.displayName ?? 'User'}
            alt={`Foto de ${user?.displayName}`}
            radius="xl"
          >
            {user?.displayName}
          </Avatar>
        </ActionIcon>
      </MantineMenu.Target>

      <MantineMenu.Dropdown>
        <MantineMenu.Item icon={<IconLogout size={18} />} onClick={() => signOut()}>
          Sair
        </MantineMenu.Item>
      </MantineMenu.Dropdown>
    </MantineMenu>
  );
}

export default LoginMenu;

import { NavLink, Switch } from '@mantine/core';
import { IconLayoutSidebar } from '@tabler/icons-react';

import { useIsDesktopDevice } from '../../hooks/useIsDesktopDevice';
import { useSidebarPreference } from '../../hooks/useSidebarPreference';

export function SidebarToggle(): JSX.Element | null {
  const isDesktopDevice = useIsDesktopDevice();
  const [sidebarPreference, setSidebarPreference] = useSidebarPreference();

  if (!isDesktopDevice) return null;

  const isSidebarOpen = sidebarPreference !== false;

  return (
    <NavLink
      label="Sidebar"
      description="Mostrar a barra lateral neste computador"
      icon={<IconLayoutSidebar size={16} stroke={1.5} />}
      rightSection={
        <Switch
          checked={isSidebarOpen}
          onChange={(event) => setSidebarPreference(event.currentTarget.checked)}
          aria-label="Mostrar sidebar"
        />
      }
    />
  );
}

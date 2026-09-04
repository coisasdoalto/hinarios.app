import { NavLink, Switch } from '@mantine/core';
import { IconWindow } from '@tabler/icons-react';

import { useSlidePopupPreference } from '../../hooks/useSlidePopupPreference';

export function SlidePopupToggle(): JSX.Element {
  const [isPopupEnabled, setIsPopupEnabled] = useSlidePopupPreference();

  function togglePreference(): void {
    setIsPopupEnabled((enabled) => !enabled);
  }

  return (
    <NavLink
      label="Slide em popup"
      description="Abrir o modo slide em outra janela"
      icon={<IconWindow size={16} stroke={1.5} />}
      onClick={togglePreference}
      rightSection={
        <Switch
          checked={isPopupEnabled}
          onChange={(event) => setIsPopupEnabled(event.currentTarget.checked)}
          onClick={(event) => event.stopPropagation()}
          aria-label="Abrir modo slide em popup"
        />
      }
    />
  );
}

import { useState } from 'react';

type ResponsiveNavbarState = {
  closeAfterNavigation: () => void;
  isNavbarOpen: boolean;
  toggleNavbar: () => void;
};

/**
 * Preserves independent mobile and wide-screen navigation preferences.
 *
 * @example const navbar = useResponsiveNavbar(isWideScreen)
 */
export function useResponsiveNavbar(isWideScreen: boolean): ResponsiveNavbarState {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isWideScreenOpen, setIsWideScreenOpen] = useState(true);
  const isNavbarOpen = isWideScreen ? isWideScreenOpen : isMobileOpen;

  function toggleNavbar(): void {
    if (isWideScreen) setIsWideScreenOpen((isOpen) => !isOpen);
    else setIsMobileOpen((isOpen) => !isOpen);
  }

  function closeAfterNavigation(): void {
    if (!isWideScreen) setIsMobileOpen(false);
  }

  return { closeAfterNavigation, isNavbarOpen, toggleNavbar };
}

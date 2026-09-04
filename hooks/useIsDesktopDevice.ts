import { useEffect, useState } from 'react';

const MOBILE_TABLET_USER_AGENT = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

function isDesktopUserAgent(userAgent: string, maxTouchPoints: number): boolean {
  if (MOBILE_TABLET_USER_AGENT.test(userAgent)) return false;
  if (/Macintosh/i.test(userAgent) && maxTouchPoints > 1) return false;

  return true;
}

/**
 * Detects whether the current browser is running on a computer.
 * @example const isDesktop = useIsDesktopDevice();
 */
export function useIsDesktopDevice(): boolean {
  const [isDesktopDevice, setIsDesktopDevice] = useState(false);

  useEffect(() => {
    setIsDesktopDevice(isDesktopUserAgent(navigator.userAgent, navigator.maxTouchPoints));
  }, []);

  return isDesktopDevice;
}

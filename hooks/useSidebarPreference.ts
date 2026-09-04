import { useLocalStorage } from '@mantine/hooks';

export const SIDEBAR_OPEN_STORAGE_KEY = 'sidebar-open';

export type SidebarPreference = boolean | null;

/**
 * Persists the user's sidebar visibility preference while allowing a responsive default.
 * @example const [preference, setPreference] = useSidebarPreference();
 */
export function useSidebarPreference(): readonly [
  SidebarPreference,
  (value: SidebarPreference | ((previous: SidebarPreference) => SidebarPreference)) => void,
  () => void
] {
  return useLocalStorage<SidebarPreference>({
    key: SIDEBAR_OPEN_STORAGE_KEY,
    defaultValue: null,
    deserialize: (value) => {
      if (value === 'true') return true;
      if (value === 'false') return false;
      return null;
    },
    serialize: (value) => String(value),
  });
}

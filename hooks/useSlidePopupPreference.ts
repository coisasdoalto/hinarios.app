import { useLocalStorage } from '@mantine/hooks';

export const SLIDE_MODE_POPUP_STORAGE_KEY = 'slide-mode-popup';

export type SlidePopupPreference = readonly [
  boolean,
  (value: boolean | ((previous: boolean) => boolean)) => void,
  () => void
];

/**
 * Persists whether the slide mode should open in a separate browser window.
 * @example const [enabled, setEnabled] = useSlidePopupPreference();
 */
export function useSlidePopupPreference(): SlidePopupPreference {
  return useLocalStorage<boolean>({
    key: SLIDE_MODE_POPUP_STORAGE_KEY,
    defaultValue: false,
    deserialize: (value) => value === 'true',
    serialize: (value) => String(value),
  });
}

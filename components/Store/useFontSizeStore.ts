import { useLocalStorage } from '@mantine/hooks';

const allowedFontSizes = ['md', 'lg', 'xl', 'xxl'] as const;

export type HymnFontSize = typeof allowedFontSizes[number];

export const hymnFontPixels: Record<HymnFontSize, number> = {
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 40,
};

/** Persists and synchronizes the hymn font preference. Example: useFontSizeStore(). */
export function useFontSizeStore() {
  const DEFAULT_FONT_SIZE: HymnFontSize = 'md';

  return useLocalStorage<HymnFontSize>({
    key: 'fontSize',
    defaultValue: DEFAULT_FONT_SIZE,
    serialize: (value) => value,
    deserialize: (value): HymnFontSize => {
      const allowedValues = new Set<HymnFontSize>(allowedFontSizes);

      if (!allowedValues.has(value as HymnFontSize)) return DEFAULT_FONT_SIZE;

      return value as HymnFontSize;
    },
  });
}

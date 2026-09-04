export type FocusColorScheme = 'dark' | 'light';

export function getFocusIndicatorColor(colorScheme: FocusColorScheme): string {
  return colorScheme === 'dark' ? '#7dd3fc' : '#1e3a8a';
}

export function getFocusIndicatorShadow(isFocused: boolean, color: string): string {
  return isFocused ? `0 0 0 1px ${color}, 0 0 8px ${color}` : 'none';
}

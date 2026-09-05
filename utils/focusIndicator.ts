export type FocusColorScheme = 'dark' | 'light';

export function getFocusIndicatorColor(colorScheme: FocusColorScheme): string {
  return colorScheme === 'dark' ? '#7dd3fc' : '#172554';
}

export function getFocusIndicatorShadow(isFocused: boolean, color: string): string {
  return isFocused ? `inset 0 0 0 2px ${color}, inset 0 0 12px ${color}` : 'none';
}

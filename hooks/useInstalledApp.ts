export function useInstalledApp() {
  if (typeof document === 'undefined') return false;

  return document.referrer.startsWith('android-app://');
}

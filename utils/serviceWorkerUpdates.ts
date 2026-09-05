export const UPDATE_CHECK_INTERVAL = 5 * 60 * 1000;
export const MIN_UPDATE_CHECK_INTERVAL = 60 * 1000;

/** Registers the PWA and checks for updates without ever reloading a page. */
export function startServiceWorkerUpdates(
  onUpdateReady: () => void,
  buildId: string | undefined
): () => void {
  if (!('serviceWorker' in navigator)) return () => {};

  const serviceWorker = navigator.serviceWorker;
  let controller = serviceWorker.controller;
  let registration: ServiceWorkerRegistration | undefined;
  let disposed = false;
  let checking = false;
  let lastCheck: number | undefined;

  const requestBuildId = () => {
    serviceWorker.controller?.postMessage({ type: 'GET_APP_BUILD_ID' });
  };

  const onMessage = (event: MessageEvent) => {
    if (
      event.source === serviceWorker.controller &&
      event.data?.type === 'APP_BUILD_ID' &&
      typeof event.data.buildId === 'string' &&
      buildId &&
      event.data.buildId !== buildId
    ) {
      onUpdateReady();
    }
  };

  const onControllerChange = () => {
    const nextController = serviceWorker.controller;
    // Claiming a page on the very first install is not an application update.
    if (controller && nextController && controller !== nextController) onUpdateReady();
    controller = nextController;
    requestBuildId();
  };

  const checkForUpdate = async () => {
    if (disposed || checking || !navigator.onLine || document.visibilityState === 'hidden')
      return;
    if (lastCheck !== undefined && Date.now() - lastCheck < MIN_UPDATE_CHECK_INTERVAL) return;

    checking = true;
    lastCheck = Date.now();
    try {
      if (!registration) {
        // register() also checks for a new worker, including on returning visits.
        registration = await serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none',
        });
      } else if (!registration.installing) {
        await registration.update();
      }
    } catch {
      // Offline/captive-portal failures should not disrupt the current hymn.
      // A later visibility, online, or timer event will retry.
    } finally {
      checking = false;
    }
  };

  serviceWorker.addEventListener('controllerchange', onControllerChange);
  serviceWorker.addEventListener('message', onMessage);
  document.addEventListener('visibilitychange', checkForUpdate);
  window.addEventListener('focus', checkForUpdate);
  window.addEventListener('pageshow', checkForUpdate);
  window.addEventListener('online', checkForUpdate);
  const interval = window.setInterval(checkForUpdate, UPDATE_CHECK_INTERVAL);
  void checkForUpdate();
  requestBuildId();

  return () => {
    disposed = true;
    window.clearInterval(interval);
    serviceWorker.removeEventListener('controllerchange', onControllerChange);
    serviceWorker.removeEventListener('message', onMessage);
    document.removeEventListener('visibilitychange', checkForUpdate);
    window.removeEventListener('focus', checkForUpdate);
    window.removeEventListener('pageshow', checkForUpdate);
    window.removeEventListener('online', checkForUpdate);
  };
}

import { defaultCache } from '@serwist/next/browser';
import type { PrecacheEntry } from '@serwist/precaching';
import { installSerwist } from '@serwist/sw';

declare const self: ServiceWorkerGlobalScope & {
  // Change this attribute's name to your `injectionPoint`.
  // `injectionPoint` is an InjectManifest option.
  // See https://serwist.pages.dev/docs/build/inject-manifest/configuring
  __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
};

// const hymnsDataCacheConfig: SerwistOptions['runtimeCaching'] = [
//   {
//     urlPattern: /\/hinos-espirituais\/.*/,
//     handler: 'CacheFirst',
//     options: {
//       cacheName: 'hymns-data',
//     },
//   },
//   {
//     urlPattern: /\/hinos-e-canticos\/.*/,
//     handler: 'CacheFirst',
//     options: {
//       cacheName: 'hymns-data',
//     },
//   },
//   {
//     urlPattern: /\/corinhos-e-canticos-de-salvacao\/.*/,
//     handler: 'CacheFirst',
//     options: {
//       cacheName: 'hymns-data',
//     },
//   },
// ];

installSerwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

// A new worker may already control a page whose HTML came from the old cache.
// Let that page compare versions even if it missed the controllerchange event.
self.addEventListener('message', (event) => {
  if (event.data?.type === 'GET_APP_BUILD_ID') {
    event.source?.postMessage({
      type: 'APP_BUILD_ID',
      buildId: process.env.NEXT_PUBLIC_APP_BUILD_ID,
    });
  }
});

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
//   {
//     urlPattern: /\/musicas-avulsas\/.*/,
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

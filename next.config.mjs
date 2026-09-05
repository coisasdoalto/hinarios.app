import serwist from '@serwist/next';
import { readFileSync } from 'fs';
import { nanoid } from 'nanoid';
import { PHASE_PRODUCTION_BUILD } from 'next/constants.js';

// const withBundleAnalyzer = require('@next/bundle-analyzer')({
//   enabled: process.env.ANALYZE === 'true',
// });

const buildId = nanoid();
const revision = buildId;

export default async (phase, { defaultConfig }) => {
  const pathsForPrecache = JSON.parse(readFileSync('./tmp/pathsForPrecache.json'));

  const withSerwist = serwist({
    swSrc: './sw.ts',
    swDest: 'public/sw.js',
    // The app owns registration so updates bypass the HTTP cache and never
    // reload an ongoing presentation automatically when connectivity returns.
    register: false,
    reloadOnOnline: false,
    maximumFileSizeToCacheInBytes: 7355608,
    disable: phase !== PHASE_PRODUCTION_BUILD,
    additionalPrecacheEntries: [
      { url: '/', revision },
      { url: '/sobre/', revision },
      { url: '/politica-de-privacidade/', revision },
      ...pathsForPrecache.map((url) => ({ url, revision })),
    ],
  });

  /**
   * @type {import('next').NextConfig}
   */
  const nextConfig = {
    env: { NEXT_PUBLIC_APP_BUILD_ID: buildId },
    async headers() {
      return [
        {
          source: '/sw.js',
          headers: [
            { key: 'Cache-Control', value: 'no-cache, max-age=0, must-revalidate' },
            { key: 'CDN-Cache-Control', value: 'no-store' },
            { key: 'Vercel-CDN-Cache-Control', value: 'no-store' },
          ],
        },
      ];
    },
    eslint: {
      ignoreDuringBuilds: true,
    },
    reactStrictMode: false,
    experimental: { scrollRestoration: true },
    trailingSlash: true,
    generateBuildId: () => buildId,
    productionBrowserSourceMaps: true,
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'play.google.com',
        },
      ],
    },
  };

  return withSerwist(nextConfig);
};

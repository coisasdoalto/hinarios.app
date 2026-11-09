import serwist from '@serwist/next';
import { createHash } from 'crypto';
import { readdirSync, readFileSync } from 'fs';
import path from 'path';
import { PHASE_PRODUCTION_BUILD } from 'next/constants.js';

// const withBundleAnalyzer = require('@next/bundle-analyzer')({
//   enabled: process.env.ANALYZE === 'true',
// });

/**
 * Hashes the hymn data so the build id only changes when the content does.
 * A random id would invalidate every precached page on every deploy.
 */
function hashDirectory(directory, hash = createHash('sha256')) {
  for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) =>
    a.name.localeCompare(b.name)
  )) {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) hashDirectory(entryPath, hash);
    else hash.update(entryPath).update(readFileSync(entryPath));
  }

  return hash;
}

const buildId = hashDirectory('./hymnsData').update(process.env.CF_PAGES_COMMIT_SHA ?? '').digest('hex').slice(0, 16);
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
    // Static export for Cloudflare Pages: every page is prerendered, and
    // `public/_headers` sets the caching rules that `headers()` used to set.
    output: 'export',
    env: { NEXT_PUBLIC_APP_BUILD_ID: buildId },
    eslint: {
      ignoreDuringBuilds: true,
    },
    reactStrictMode: false,
    experimental: { scrollRestoration: true },
    trailingSlash: true,
    generateBuildId: () => buildId,
    productionBrowserSourceMaps: false,
    images: {
      unoptimized: true,
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

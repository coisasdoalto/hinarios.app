/* eslint-disable no-restricted-globals */
import { ColorScheme, ColorSchemeProvider, MantineProvider } from '@mantine/core';
import { NotificationsProvider } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProps } from 'next/app';
import Head from 'next/head';
import posthog from 'posthog-js';
import Layout from '../components/Layout/Layout';
import { HymnBooksProvider, useCreateHymnBooksCache } from '../context/HymnBooks';
import useColorScheme from '../hooks/useColorScheme';

import '../firebase/web';

if (typeof window !== 'undefined') {
  posthog.init('phc_sHWgUAgxkRXAAv7NSyPnkUWaOzM0hnccRL644rlXpb1', {
    api_host: 'https://app.posthog.com',
    autocapture: process.env.NODE_ENV === 'production',
    capture_pageview: process.env.NODE_ENV === 'production',
    capture_performance: process.env.NODE_ENV === 'production',
    capture_pageleave: process.env.NODE_ENV === 'production',
    bootstrap: {
      featureFlags: {
        login: false,
        bookmarks: false,
      },
    },
  });

  posthog.setPersonPropertiesForFlags({
    environment: process.env.NODE_ENV,
  });

  localStorage.getItem('UpdateNewSearchDimissed') === 'true' && posthog.capture('have_dismissed_new_search');
}

export const queryClient = new QueryClient();

export default function App(props: AppProps & { colorScheme: ColorScheme }) {
  const { Component, pageProps } = props;

  const { colorScheme, toggleColorScheme } = useColorScheme();

  const hymnBooksCache = useCreateHymnBooksCache();

  return (
    <>
      <Head>
        <title>Hinários</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />

        {/* <meta name="application-name" content="Hinários App" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Hinários App" />
        <meta name="description" content="Múltiplos hinários em formato digital de fácil acesso e offline!" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" /> */}

        {/* <meta name="theme-color" content="#1f90ef" /> */}

        {/* <link rel="apple-touch-icon" href="/icons/touch-icon-iphone.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/touch-icon-ipad.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/touch-icon-iphone-retina.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icons/touch-icon-ipad-retina.png" /> */}

        {/* <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" /> */}
        <link rel="manifest" href="/manifest.json" />
        {/* <link rel="mask-icon" href="/icons/safari-pinned-tab.svg" color="#5bbad5" /> */}
        <link rel="shortcut icon" href="/favicon.svg" />

        {/* <meta name="twitter:card" content="summary" />
        <meta name="twitter:url" content="https://hinarios.app" />
        <meta name="twitter:title" content="Hinários App" />
        <meta name="twitter:description" content="Múltiplos hinários em formato digital de fácil acesso e offline!" />
        <meta
          name="twitter:image"
          content="https://hinarios.app/icons/android-chrome-192x192.png"
        />
        <meta name="twitter:creator" content="@DavidWShadow" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Hinários App" />
        <meta property="og:description" content="Múltiplos hinários em formato digital de fácil acesso e offline!" />
        <meta property="og:site_name" content="Hinários App" />
        <meta property="og:url" content="https://hinarios.app" />
        <meta property="og:image" content="https://hinarios.app/icons/apple-touch-icon.png" /> */}

        {/* <!-- apple splash screen images --> */}
        {/* <link rel='apple-touch-startup-image' href='/images/apple_splash_2048.png' sizes='2048x2732' />
        <link rel='apple-touch-startup-image' href='/images/apple_splash_1668.png' sizes='1668x2224' />
        <link rel='apple-touch-startup-image' href='/images/apple_splash_1536.png' sizes='1536x2048' />
        <link rel='apple-touch-startup-image' href='/images/apple_splash_1125.png' sizes='1125x2436' />
        <link rel='apple-touch-startup-image' href='/images/apple_splash_1242.png' sizes='1242x2208' />
        <link rel='apple-touch-startup-image' href='/images/apple_splash_750.png' sizes='750x1334' />
        <link rel='apple-touch-startup-image' href='/images/apple_splash_640.png' sizes='640x1136' />
        */}
      </Head>

      <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
        <MantineProvider theme={{ colorScheme }} withGlobalStyles withNormalizeCSS>
          <NotificationsProvider position="top-right">
            <HymnBooksProvider hymnBooksCache={hymnBooksCache}>
              <QueryClientProvider client={queryClient}>
                <Layout>
                  <Component {...pageProps} />
                </Layout>
              </QueryClientProvider>
            </HymnBooksProvider>
          </NotificationsProvider>
        </MantineProvider>
      </ColorSchemeProvider>
    </>
  );
}

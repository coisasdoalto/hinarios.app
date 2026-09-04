import {
  Box,
  Breadcrumbs,
  Burger,
  Button,
  Container,
  Group,
  Header,
  AppShell as MantineAppShell,
  Navbar,
  useMantineTheme,
} from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { PropsWithChildren } from 'react';

import { Feedback } from 'components/Feedback';
import { PlayStoreButton } from 'components/PlayStoreButton';
import { getFocusIndicatorColor, getFocusIndicatorShadow } from 'utils/focusIndicator';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useHymnBooks } from '../../context/HymnBooks';
import { useSidebarPreference } from '../../hooks/useSidebarPreference';
import { useWindowFocus } from '../../hooks/useWindowFocus';
import LoginMenu from '../LoginMenu';
import Search from '../Search/Search';
import VerticalNavigation from '../VerticalNavigation/VerticalNavigation';
import { NearbySongs } from 'components/NearbySongs';
import { stringToAcronym } from 'utils/stringToAcronym';

export default function AppShell({ children }: PropsWithChildren) {
  const theme = useMantineTheme();
  const [sidebarPreference, setSidebarPreference] = useSidebarPreference();
  const isMobileViewport = useMediaQuery('(max-width: 767px)');
  const isSidebarOpen = sidebarPreference ?? !isMobileViewport;
  const isWindowFocused = useWindowFocus();
  const focusColor = getFocusIndicatorColor(theme.colorScheme);

  const router = useRouter();

  const [hymnBooks] = useHymnBooks();

  const hymnBook = hymnBooks?.find((item) => item.slug === router.query.hymnBook);

  function toggleSidebar(): void {
    setSidebarPreference(!isSidebarOpen);
  }

  function closeSidebarAfterNavigation(): void {
    if (isMobileViewport) setSidebarPreference(false);
  }

  return (
    <MantineAppShell
      navbarOffsetBreakpoint={isSidebarOpen ? 'sm' : undefined}
      sx={{
        boxShadow: getFocusIndicatorShadow(isWindowFocused, focusColor),
      }}
      styles={{
        main: {
          background: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
        },
      }}
      asideOffsetBreakpoint="sm"
      navbar={
        <Navbar
          p="md"
          hiddenBreakpoint="sm"
          hidden={!isSidebarOpen}
          sx={(navbarTheme) => ({
            [navbarTheme.fn.largerThan('sm')]: {
              display: isSidebarOpen ? 'flex' : 'none',
            },
          })}
          width={{ sm: 200, lg: 300 }}
        >
          <VerticalNavigation onNavigation={closeSidebarAfterNavigation} />
        </Navbar>
      }
      // footer={
      //   <Footer height={60} p="md">
      //     audio player
      //   </Footer>
      // }
      header={
        <Header height={{ base: 50, md: 70 }} p="md">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              height: '100%',
            }}
          >
            <Burger
              opened={isSidebarOpen}
              onClick={toggleSidebar}
              aria-label="Abrir ou fechar sidebar"
              size="sm"
              color={theme.colors.gray[6]}
              mr="xl"
            />

            <Breadcrumbs sx={{ marginRight: 'auto' }}>
              <Button variant="subtle" component={Link} href="/" compact>
                Hinários
              </Button>
              {hymnBook && (
                <Button variant="subtle" component={Link} href={`/${hymnBook.slug}`} compact>
                  {stringToAcronym(hymnBook.name)}
                </Button>
              )}
            </Breadcrumbs>

            <Group spacing="xs">
              <Search />

              <LoginMenu />
            </Group>
          </div>
        </Header>
      }
    >
      <Box pb="6rem">
        <Container px={0} py={16}>
          {children}
        </Container>

        <Feedback />

        <PlayStoreButton />

        <NearbySongs />
      </Box>
    </MantineAppShell>
  );
}

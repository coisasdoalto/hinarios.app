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
import { PropsWithChildren, ReactElement } from 'react';

import { Feedback } from 'components/Feedback';
import { NearbySongs } from 'components/NearbySongs';
import { PlayStoreButton } from 'components/PlayStoreButton';
import { useResponsiveNavbar } from 'hooks/useResponsiveNavbar';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { stringToAcronym } from 'utils/stringToAcronym';
import { useHymnBooks } from '../../context/HymnBooks';
import LoginMenu from '../LoginMenu';
import Search from '../Search/Search';
import VerticalNavigation from '../VerticalNavigation/VerticalNavigation';

export default function AppShell({ children }: PropsWithChildren): ReactElement {
  const theme = useMantineTheme();
  const isWideScreen = useMediaQuery(`(min-width: ${theme.breakpoints.sm}px)`);
  const { closeAfterNavigation, isNavbarOpen, toggleNavbar } = useResponsiveNavbar(isWideScreen);

  const router = useRouter();

  const [hymnBooks] = useHymnBooks();

  const hymnBook = hymnBooks?.find((item) => item.slug === router.query.hymnBook);

  return (
    <MantineAppShell
      styles={{
        main: {
          background: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0],
        },
      }}
      navbarOffsetBreakpoint="sm"
      asideOffsetBreakpoint="sm"
      navbar={
        isNavbarOpen ? (
          <Navbar p="md" width={{ sm: 200, lg: 300 }}>
            <VerticalNavigation onNavigation={closeAfterNavigation} />
          </Navbar>
        ) : undefined
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
              aria-label={isNavbarOpen ? 'Esconder menu lateral' : 'Mostrar menu lateral'}
              opened={isNavbarOpen}
              onClick={toggleNavbar}
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
                  {hymnBook.acronym ?? stringToAcronym(hymnBook.name)}
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

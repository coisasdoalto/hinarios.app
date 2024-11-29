import {
  Anchor,
  Breadcrumbs,
  Burger,
  Button,
  Center,
  Container,
  Group,
  Header,
  AppShell as MantineAppShell,
  MediaQuery,
  Navbar,
  useMantineTheme,
} from '@mantine/core';
import { PropsWithChildren, useState } from 'react';

import { Feedback } from 'components/Feedback';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useHymnBooks } from '../../context/HymnBooks';
import LoginMenu from '../LoginMenu';
import Search from '../Search/Search';
import VerticalNavigation from '../VerticalNavigation/VerticalNavigation';

export default function AppShell({ children }: PropsWithChildren) {
  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);

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
        <Navbar p="md" hiddenBreakpoint="sm" hidden={!opened} width={{ sm: 200, lg: 300 }}>
          <VerticalNavigation
            onNavigation={() => {
              setOpened(false);
            }}
          />
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
            <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
              <Burger
                opened={opened}
                onClick={() => setOpened((o) => !o)}
                size="sm"
                color={theme.colors.gray[6]}
                mr="xl"
              />
            </MediaQuery>

            <Breadcrumbs sx={{ marginRight: 'auto' }}>
              <Button variant="subtle" component={Link} href="/" compact>
                Hinários
              </Button>
              {hymnBook && (
                <Button variant="subtle" component={Link} href={`/${hymnBook.slug}`} compact>
                  {hymnBook.name
                    .split(' ')
                    .map((item) => item[0])
                    .filter((item) => /[A-Z]/.test(item))
                    .join('')}
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
      <Container px={0} py={16}>
        {children}
      </Container>

      <Feedback />

      <Container size="xs" mt="xl">
        <Center mb="md">
          <Anchor
            target="_blank"
            rel="noopener noreferrer"
            href="https://play.google.com/store/apps/details?id=app.hinarios.twa"
            title="Baixar no Google Play"
          >
            <img
              alt="Disponível no Google Play"
              src="https://play.google.com/intl/en_us/badges/static/images/badges/pt_badge_web_generic.png"
              height={64}
            />
          </Anchor>
        </Center>
      </Container>
    </MantineAppShell>
  );
}

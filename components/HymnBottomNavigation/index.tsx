import {
  Affix,
  Box,
  Button,
  Center,
  Container,
  Paper,
  Text,
  useMantineTheme,
} from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import Link from 'next/link';
import { useFeatureFlagEnabled } from 'posthog-js/react';
import { HymnsIndex } from 'schemas/hymnsIndex';

type HymnNavigationItem = HymnsIndex[number];

type NavigationButtonProps = {
  align: 'left' | 'right';
  directionLabel: string;
  href?: string;
  hymn?: HymnNavigationItem | null;
};

function NavigationButton({ align, directionLabel, href, hymn }: NavigationButtonProps) {
  const content = (
    <Box
      sx={(theme) => ({
        minWidth: 0,
        width: '100%',
        textAlign: align,
        [theme.fn.smallerThan('sm')]: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: align === 'left' ? 'flex-start' : 'flex-end',
        },
      })}
    >
      <Text
        size="xs"
        color="dimmed"
        sx={(theme) => ({
          [theme.fn.smallerThan('sm')]: {
            fontSize: theme.fontSizes.sm,
            lineHeight: 1.1,
          },
        })}
      >
        {directionLabel}
      </Text>
      <Text
        size="sm"
        weight={700}
        sx={(theme) => ({
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          [theme.fn.smallerThan('sm')]: {
            display: 'none',
          },
        })}
      >
        {hymn ? `${hymn.number}. ${hymn.title}` : 'Indisponível'}
      </Text>
      <Text
        size="sm"
        weight={700}
        sx={(theme) => ({
          display: 'none',
          [theme.fn.smallerThan('sm')]: {
            display: 'none',
          },
        })}
      >
        {hymn ? hymn.number : '-'}
      </Text>
    </Box>
  );

  if (!hymn || !href) {
    return (
      <Button
        disabled
        variant="subtle"
        color="gray"
        sx={(theme) => ({
          height: '100%',
          minHeight: 60,
          paddingInline: 14,
          borderTopLeftRadius: align === 'left' ? 999 : theme.radius.sm,
          borderBottomLeftRadius: align === 'left' ? 999 : theme.radius.sm,
          borderTopRightRadius: align === 'right' ? 999 : theme.radius.sm,
          borderBottomRightRadius: align === 'right' ? 999 : theme.radius.sm,
          [theme.fn.smallerThan('sm')]: {
            minHeight: 38,
            paddingInline: 10,
            borderRadius: 999,
          },
        })}
        styles={{
          inner: {
            justifyContent: align === 'left' ? 'flex-start' : 'flex-end',
            width: '100%',
          },
          label: {
            width: '100%',
          },
        }}
        leftIcon={align === 'left' ? <IconChevronLeft size="1rem" /> : undefined}
        rightIcon={align === 'right' ? <IconChevronRight size="1rem" /> : undefined}
      >
        {content}
      </Button>
    );
  }

  return (
    <Button
      component={Link}
      href={href}
      variant="subtle"
      color="gray"
      sx={(theme) => ({
        height: '100%',
        minHeight: 60,
        paddingInline: 14,
        borderTopLeftRadius: align === 'left' ? 999 : theme.radius.sm,
        borderBottomLeftRadius: align === 'left' ? 999 : theme.radius.sm,
        borderTopRightRadius: align === 'right' ? 999 : theme.radius.sm,
        borderBottomRightRadius: align === 'right' ? 999 : theme.radius.sm,
        [theme.fn.smallerThan('sm')]: {
          minHeight: 38,
          paddingInline: 10,
          borderRadius: 999,
        },
      })}
      styles={{
        inner: {
          justifyContent: align === 'left' ? 'flex-start' : 'flex-end',
          width: '100%',
        },
        label: {
          width: '100%',
        },
      }}
      leftIcon={align === 'left' ? <IconChevronLeft size="1rem" /> : undefined}
      rightIcon={align === 'right' ? <IconChevronRight size="1rem" /> : undefined}
    >
      {content}
    </Button>
  );
}

type HymnBottomNavigationProps = {
  currentHymnNumber: HymnNavigationItem['number'];
  hymnBookSlug: string;
  previousHymn?: HymnNavigationItem | null;
  nextHymn?: HymnNavigationItem | null;
};

export function HymnBottomNavigation({
  currentHymnNumber,
  hymnBookSlug,
  previousHymn,
  nextHymn,
}: HymnBottomNavigationProps) {
  const isHymnBottomNavigationEnabled = useFeatureFlagEnabled('hymn-bottom-navigation');
  const theme = useMantineTheme();

  const backgroundColor =
    theme.colorScheme === 'dark'
      ? theme.fn.rgba(theme.colors.dark[7], 0.94)
      : theme.fn.rgba(theme.white, 0.94);

  if (!isHymnBottomNavigationEnabled) {
    return null;
  }

  return (
    <Affix
      position={{ bottom: 16, left: 0, right: 0 }}
      zIndex={3}
      sx={(themeValue) => ({
        [themeValue.fn.largerThan('sm')]: {
          left: 200,
        },
        [themeValue.fn.largerThan('lg')]: {
          left: 300,
        },
      })}
    >
      <Container size="xs" px="xs">
        <Paper
          withBorder
          radius="xl"
          shadow="xl"
          p={6}
          sx={(themeValue) => ({
            backgroundColor,
            backdropFilter: 'blur(12px)',
            [themeValue.fn.smallerThan('sm')]: {
              borderRadius: 999,
              padding: 4,
            },
          })}
        >
          <Box
            sx={(themeValue) => ({
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr) auto minmax(0, 1fr)',
              alignItems: 'center',
              gap: themeValue.spacing.xs,
              [themeValue.fn.smallerThan('sm')]: {
                gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
                gap: 2,
              },
            })}
          >
            <NavigationButton
              align="left"
              directionLabel="Anterior"
              hymn={previousHymn}
              href={previousHymn ? `/${hymnBookSlug}/${previousHymn.slug}` : undefined}
            />

            <Center
              sx={(themeValue) => ({
                minWidth: 76,
                alignSelf: 'stretch',
                paddingInline: themeValue.spacing.sm,
                [themeValue.fn.smallerThan('sm')]: {
                  display: 'none',
                },
              })}
            >
              <Box ta="center">
                <Text size="xs" color="dimmed">
                  Hino
                </Text>
                <Text size="sm" weight={700}>
                  {currentHymnNumber}
                </Text>
              </Box>
            </Center>

            <NavigationButton
              align="right"
              directionLabel="Próximo"
              hymn={nextHymn}
              href={nextHymn ? `/${hymnBookSlug}/${nextHymn.slug}` : undefined}
            />
          </Box>
        </Paper>
      </Container>
    </Affix>
  );
}

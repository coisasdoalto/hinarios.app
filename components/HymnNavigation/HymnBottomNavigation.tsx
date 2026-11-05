import { Box, Button, Center, Container, Paper, Text } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import Link from 'next/link';

import type { HymnNavigationItem } from './index';

type NavigationButtonProps = {
  align: 'left' | 'right';
  directionLabel: string;
  href?: string;
  hymn?: HymnNavigationItem | null;
  showNumbers: boolean;
};

function NavigationButton({
  align,
  directionLabel,
  href,
  hymn,
  showNumbers,
}: NavigationButtonProps) {
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
        {hymn ? `${showNumbers ? `${hymn.number}. ` : ''}${hymn.title}` : 'Indisponível'}
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
        {hymn ? (showNumbers ? hymn.number : hymn.title) : '-'}
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
  currentHymnNumber?: HymnNavigationItem['number'];
  hymnBookSlug: string;
  previousHymn?: HymnNavigationItem | null;
  nextHymn?: HymnNavigationItem | null;
  showNumbers?: boolean;
  /**
   * `auto` shows the bar on phones only (before the page is measured);
   * `visible`/`hidden` follow whether the side arrows fit.
   */
  visibility?: 'auto' | 'visible' | 'hidden';
};

/**
 * The original previous/next bar, placed after the hymn content (not
 * floating). Used on phones and whenever the side arrows do not fit next to
 * the content.
 */
export function HymnBottomNavigation({
  currentHymnNumber,
  hymnBookSlug,
  previousHymn,
  nextHymn,
  showNumbers = true,
  visibility = 'auto',
}: HymnBottomNavigationProps) {
  return (
    <Box
      mt="xl"
      sx={(themeValue) => ({
        display: visibility === 'hidden' ? 'none' : undefined,
        ...(visibility === 'auto' && {
          [themeValue.fn.largerThan('sm')]: { display: 'none' },
        }),
      })}
    >
      <Container size="xs" px={0}>
        <Paper
          withBorder
          radius="xl"
          p={6}
          sx={(themeValue) => ({
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
              showNumbers={showNumbers}
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
                  {showNumbers ? 'Hino' : 'Música'}
                </Text>
                {showNumbers && (
                  <Text size="sm" weight={700}>
                    {currentHymnNumber}
                  </Text>
                )}
              </Box>
            </Center>

            <NavigationButton
              align="right"
              directionLabel="Próximo"
              hymn={nextHymn}
              showNumbers={showNumbers}
              href={nextHymn ? `/${hymnBookSlug}/${nextHymn.slug}` : undefined}
            />
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

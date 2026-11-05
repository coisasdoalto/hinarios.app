import { Box, Button, ButtonProps, CSSObject, Kbd, MantineTheme, Text } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import Link from 'next/link';
import { ReactNode } from 'react';

import { useFeatureFlagEnabled } from '../../hooks/useFeatureFlagEnabled';
import { useIsDesktopDevice } from '../../hooks/useIsDesktopDevice';
import { NEXT_KEY, PREVIOUS_KEY, usePagerNavigation } from '../../hooks/usePagerNavigation';
import { useIsSlideModeOpen } from '../SlideMode/SlideModeProvider';
import { HymnBottomNavigation } from './HymnBottomNavigation';

export type HymnNavigationItem = {
  number?: number | string;
  title: string;
  subtitle?: string;
  slug: string;
};

type Direction = 'previous' | 'next';

const DIRECTIONS = {
  previous: { label: 'Anterior', arrow: '←', shortcut: PREVIOUS_KEY, Icon: IconChevronLeft },
  next: { label: 'Próximo', arrow: '→', shortcut: NEXT_KEY, Icon: IconChevronRight },
} as const;

/** Phones get the original bottom bar; larger screens get the top bar buttons */
const FLOATING_BAR_BREAKPOINT = 'sm';

/** Subtle outlined key cap, as in biblias.app */
const subtleKbdStyles = {
  height: 20,
  minWidth: 20,
  padding: '0 4px',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid currentColor',
  borderRadius: 4,
  backgroundColor: 'transparent',
  color: 'inherit',
  fontSize: 12,
  fontWeight: 500,
  lineHeight: 1,
  opacity: 0.6,
};

/**
 * Joins the two buttons into one outlined segmented control. Mantine's
 * Button.Group picks the rounded corners with :first-of-type, which breaks
 * when a link sits next to a disabled button.
 */
function segmentStyles(theme: MantineTheme, position: 'first' | 'last'): CSSObject {
  const colors = theme.fn.variant({ variant: 'default' });
  const borderColor = theme.colorScheme === 'dark' ? theme.colors.dark[4] : theme.colors.gray[4];
  const radius = theme.radius.sm;

  return {
    minWidth: 0,
    border: `1px solid ${borderColor}`,
    ...(position === 'first'
      ? { borderRadius: `${radius}px 0 0 ${radius}px` }
      : { borderRadius: `0 ${radius}px ${radius}px 0`, marginLeft: -1 }),
    '&[data-disabled]': {
      backgroundColor: colors.background,
      borderColor,
      color: colors.color,
      '& .mantine-Button-inner': { opacity: 0.4 },
    },
  };
}

/**
 * Arrow key hint on computers (they have a keyboard); the chevron stays on
 * touch devices, where swiping also navigates.
 */
function ArrowHint({ direction, showKey }: { direction: Direction; showKey: boolean }) {
  const { arrow, Icon } = DIRECTIONS[direction];

  if (!showKey) return <Icon size="1rem" />;

  return (
    <Kbd aria-hidden sx={subtleKbdStyles}>
      {arrow}
    </Kbd>
  );
}

type PagerItem = { direction: Direction; href?: string; hymnLabel?: string };

type PagerLinkProps = PagerItem & {
  buttonProps: ButtonProps;
  children: ReactNode;
};

/** Link to the previous/next hymn, or a disabled button at the ends of the list */
function PagerLink({ direction, href, hymnLabel, buttonProps, children }: PagerLinkProps) {
  const { label, arrow, shortcut } = DIRECTIONS[direction];

  if (!href || !hymnLabel) {
    return (
      <Button {...buttonProps} disabled aria-label={label}>
        {children}
      </Button>
    );
  }

  return (
    <Button
      {...buttonProps}
      component={Link}
      href={href}
      title={`${hymnLabel} (${arrow})`}
      aria-label={`${label}: ${hymnLabel}`}
      aria-keyshortcuts={shortcut}
    >
      {children}
    </Button>
  );
}

/** Outlined, joined buttons in the app top bar (tablets and computers) */
function TopBarNavigation({ items, showKeyHint }: { items: PagerItem[]; showKeyHint: boolean }) {
  return (
    <Box
      component="nav"
      aria-label="Navegação entre hinos"
      sx={(theme) => ({
        minWidth: 0,
        display: 'flex',
        [theme.fn.smallerThan(FLOATING_BAR_BREAKPOINT)]: { display: 'none' },
      })}
    >
      <Box sx={{ display: 'flex', minWidth: 0 }}>
        {items.map((item, index) => {
          const hint = <ArrowHint direction={item.direction} showKey={showKeyHint} />;

          return (
            <PagerLink
              key={item.direction}
              {...item}
              buttonProps={{
                variant: 'default',
                size: 'xs',
                sx: (theme) => ({
                  ...segmentStyles(theme, index === 0 ? 'first' : 'last'),
                  flexShrink: 1,
                  fontWeight: 500,
                }),
                styles: { label: { minWidth: 0 } },
                leftIcon: item.direction === 'previous' ? hint : undefined,
                rightIcon: item.direction === 'next' ? hint : undefined,
              }}
            >
              <Text
                component="span"
                sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                {item.hymnLabel ?? DIRECTIONS[item.direction].label}
              </Text>
            </PagerLink>
          );
        })}
      </Box>
    </Box>
  );
}

type HymnNavigationProps = {
  hymnBookSlug: string;
  /** Number of the hymn being shown, displayed in the mobile bottom bar */
  currentNumber?: number | string;
  previousHymn?: HymnNavigationItem | null;
  nextHymn?: HymnNavigationItem | null;
  showNumbers?: boolean;
};

export function HymnNavigation({
  hymnBookSlug,
  currentNumber,
  previousHymn,
  nextHymn,
  showNumbers = true,
}: HymnNavigationProps) {
  const isHymnNavigationEnabled = useFeatureFlagEnabled('hymn-bottom-navigation');
  const isSlideModeOpen = useIsSlideModeOpen();
  const isDesktopDevice = useIsDesktopDevice();
  const toItem = (direction: Direction, hymn?: HymnNavigationItem | null): PagerItem => ({
    direction,
    href: hymn ? `/${hymnBookSlug}/${hymn.slug}` : undefined,
    hymnLabel: hymn ? `${showNumbers ? `${hymn.number}. ` : ''}${hymn.title}` : undefined,
  });
  const items = [toItem('previous', previousHymn), toItem('next', nextHymn)];

  // One instance handles keys and swipes for both layouts
  usePagerNavigation({
    previousHref: items[0].href,
    nextHref: items[1].href,
    enabled: Boolean(isHymnNavigationEnabled) && !isSlideModeOpen,
  });

  if (!isHymnNavigationEnabled) {
    return null;
  }

  return (
    <>
      <TopBarNavigation items={items} showKeyHint={isDesktopDevice} />
      <HymnBottomNavigation
        currentHymnNumber={currentNumber}
        hymnBookSlug={hymnBookSlug}
        previousHymn={previousHymn}
        nextHymn={nextHymn}
        showNumbers={showNumbers}
      />
    </>
  );
}

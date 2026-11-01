import { Affix, Box, Button, ButtonProps, CSSObject, Kbd, MantineTheme, Text } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import Link from 'next/link';
import { ReactNode } from 'react';

import { useFeatureFlagEnabled } from '../../hooks/useFeatureFlagEnabled';
import { useIsDesktopDevice } from '../../hooks/useIsDesktopDevice';
import { NEXT_KEY, PREVIOUS_KEY, usePagerNavigation } from '../../hooks/usePagerNavigation';
import { useIsSlideModeOpen } from '../SlideMode/SlideModeProvider';

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

/** Phones get the floating bar; larger screens get the top bar buttons */
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

type SegmentPosition = 'first' | 'middle' | 'last';

/**
 * Joins buttons into one segmented control. Mantine's Button.Group picks the
 * rounded corners with :first-of-type, which breaks when the segments mix
 * links, disabled buttons and spans.
 */
function segmentStyles(
  theme: MantineTheme,
  position: SegmentPosition,
  variant: 'default' | 'filled',
  radius: number
): CSSObject {
  const colors = theme.fn.variant({ variant, color: variant === 'filled' ? undefined : 'gray' });
  const borderColor =
    variant === 'filled'
      ? theme.fn.rgba(theme.white, 0.15)
      : theme.colorScheme === 'dark'
      ? theme.colors.dark[4]
      : theme.colors.gray[4];

  return {
    minWidth: 0,
    border: `1px solid ${borderColor}`,
    borderRadius: 0,
    ...(position !== 'first' && { marginLeft: -1 }),
    ...(position === 'first' && {
      borderTopLeftRadius: radius,
      borderBottomLeftRadius: radius,
    }),
    ...(position === 'last' && {
      borderTopRightRadius: radius,
      borderBottomRightRadius: radius,
    }),
    '&[data-disabled]': {
      backgroundColor: colors.background,
      borderColor,
      color: colors.color,
      opacity: 1,
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
                  ...segmentStyles(
                    theme,
                    index === 0 ? 'first' : 'last',
                    'default',
                    theme.radius.sm
                  ),
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

const FLOATING_RADIUS = 999;

const floatingSegmentProps = (position: SegmentPosition): ButtonProps => ({
  variant: 'filled',
  h: 44,
  px: position === 'middle' ? 'md' : 14,
  sx: (theme) => ({
    ...segmentStyles(theme, position, 'filled', FLOATING_RADIUS),
    // The current hymn is a label, not a control
    ...(position === 'middle' && { pointerEvents: 'none' }),
  }),
});

/** Floating bar at the bottom of the screen (phones) */
function FloatingNavigation({ items, current }: { items: PagerItem[]; current?: string }) {
  const [previous, next] = items;

  return (
    <Affix
      position={{ bottom: 0, left: 0, right: 0 }}
      zIndex={3}
      sx={(theme) => ({
        pointerEvents: 'none',
        display: 'flex',
        justifyContent: 'center',
        paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
        [theme.fn.largerThan(FLOATING_BAR_BREAKPOINT)]: { display: 'none' },
      })}
    >
      <Box component="nav" aria-label="Navegação entre hinos" sx={{ pointerEvents: 'auto' }}>
        <Box
          sx={(theme) => ({
            display: 'flex',
            borderRadius: FLOATING_RADIUS,
            boxShadow: theme.shadows.md,
          })}
        >
          <PagerLink {...previous} buttonProps={floatingSegmentProps('first')}>
            <IconChevronLeft size="1.25rem" />
          </PagerLink>
          {current && (
            <Button component="span" {...floatingSegmentProps('middle')}>
              {current}
            </Button>
          )}
          <PagerLink {...next} buttonProps={floatingSegmentProps('last')}>
            <IconChevronRight size="1.25rem" />
          </PagerLink>
        </Box>
      </Box>
    </Affix>
  );
}

type HymnNavigationProps = {
  hymnBookSlug: string;
  /** Number of the hymn being shown, displayed in the mobile floating bar */
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
      <FloatingNavigation
        items={items}
        current={showNumbers && currentNumber !== undefined ? `Hino ${currentNumber}` : undefined}
      />
    </>
  );
}

import { ActionIcon, Group, Kbd, Text, Tooltip } from '@mantine/core';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import Link from 'next/link';

import { useFeatureFlagEnabled } from '../../hooks/useFeatureFlagEnabled';
import { useIsDesktopDevice } from '../../hooks/useIsDesktopDevice';
import { NEXT_KEY, PREVIOUS_KEY, usePagerNavigation } from '../../hooks/usePagerNavigation';
import { useIsSlideModeOpen } from '../SlideMode/SlideModeProvider';
import { HymnBottomNavigation } from './HymnBottomNavigation';
import { SIDE_ARROW_SIZE, useSideArrowLayout } from './sideArrowLayout';

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
  opacity: 0.7,
};

type SideArrowProps = {
  direction: Direction;
  href: string;
  hymnLabel: string;
  x: number;
  showKeyHint: boolean;
};

/** Arrow fixed at mid-screen height, next to the content column */
function SideArrow({ direction, href, hymnLabel, x, showKeyHint }: SideArrowProps) {
  const { label, arrow, shortcut, Icon } = DIRECTIONS[direction];
  const keyHint = showKeyHint && <Kbd sx={subtleKbdStyles}>{arrow}</Kbd>;

  return (
    <Tooltip
      withinPortal
      position={direction === 'previous' ? 'right' : 'left'}
      label={
        <Group spacing={8} noWrap>
          {direction === 'previous' && keyHint}
          <Text size="sm">
            {label}: {hymnLabel}
          </Text>
          {direction === 'next' && keyHint}
        </Group>
      }
    >
      <ActionIcon
        component={Link}
        href={href}
        aria-label={`${label}: ${hymnLabel}`}
        aria-keyshortcuts={shortcut}
        variant="default"
        radius="xl"
        size={SIDE_ARROW_SIZE}
        sx={(theme) => ({
          position: 'fixed',
          zIndex: 3,
          left: x,
          // Middle of the visible area below the app header. Not centered with
          // a transform: Mantine sets one on :active, which would move the
          // arrow away from the pointer mid-click.
          top: `calc(50% + var(--mantine-header-height, 0px) / 2 - ${SIDE_ARROW_SIZE / 2}px)`,
          opacity: 0.7,
          boxShadow: theme.shadows.sm,
          transition: 'opacity 150ms ease',
          '&:hover, &:focus-visible': { opacity: 1 },
        })}
      >
        <Icon size="1.5rem" stroke={1.5} />
      </ActionIcon>
    </Tooltip>
  );
}

type HymnNavigationProps = {
  hymnBookSlug: string;
  /** Number of the hymn being shown, displayed in the bottom bar */
  currentNumber?: number | string;
  previousHymn?: HymnNavigationItem | null;
  nextHymn?: HymnNavigationItem | null;
  showNumbers?: boolean;
};

/**
 * Previous/next hymn navigation: arrows on the sides of the content when
 * there is room (desktop), otherwise the original floating bottom bar.
 * Arrow keys and swipes work in both.
 */
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
  const layout = useSideArrowLayout();

  const toItem = (direction: Direction, hymn?: HymnNavigationItem | null) => ({
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

  const arrows = layout?.arrows;

  return (
    <>
      {arrows &&
        items.map(
          ({ direction, href, hymnLabel }) =>
            href &&
            hymnLabel && (
              <SideArrow
                key={direction}
                direction={direction}
                href={href}
                hymnLabel={hymnLabel}
                x={arrows[direction]}
                showKeyHint={isDesktopDevice}
              />
            )
        )}
      <HymnBottomNavigation
        currentHymnNumber={currentNumber}
        hymnBookSlug={hymnBookSlug}
        previousHymn={previousHymn}
        nextHymn={nextHymn}
        showNumbers={showNumbers}
        visibility={layout === undefined ? 'auto' : arrows ? 'hidden' : 'visible'}
        areaLeft={layout?.areaLeft}
      />
    </>
  );
}

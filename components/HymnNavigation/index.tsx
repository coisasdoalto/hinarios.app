import { Box, Button, ButtonProps, Kbd, Text } from '@mantine/core';
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

/**
 * Arrow key hint on computers (they have a keyboard); the chevron stays on
 * touch devices, where swiping also navigates.
 */
function ArrowHint({ arrow, icon, showKey }: { arrow: string; icon: ReactNode; showKey: boolean }) {
  if (!showKey) return <>{icon}</>;

  return (
    <Kbd aria-hidden sx={{ fontSize: 12, lineHeight: 1.2, paddingInline: 6 }}>
      {arrow}
    </Kbd>
  );
}

type NavigationButtonProps = {
  align: 'left' | 'right';
  showKeyHint: boolean;
  directionLabel: string;
  href?: string;
  hymn?: HymnNavigationItem | null;
  showNumbers: boolean;
};

function NavigationButton({
  align,
  showKeyHint,
  directionLabel,
  href,
  hymn,
  showNumbers,
}: NavigationButtonProps) {
  const hymnLabel = hymn ? `${showNumbers ? `${hymn.number}. ` : ''}${hymn.title}` : undefined;
  const arrow = align === 'left' ? '←' : '→';
  const shortcut = align === 'left' ? PREVIOUS_KEY : NEXT_KEY;
  const title = `${hymnLabel ?? directionLabel} (${arrow})`;
  const label = (
    <Text
      component="span"
      sx={(theme) => ({
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        [theme.fn.smallerThan('sm')]: { display: 'none' },
      })}
    >
      {hymnLabel ?? directionLabel}
    </Text>
  );

  const buttonProps: ButtonProps = {
    variant: 'subtle',
    color: 'gray',
    size: 'xs',
    sx: (theme) => ({
      minWidth: 0,
      maxWidth: '100%',
      paddingInline: 8,
      '&[data-disabled]': { backgroundColor: 'transparent' },
      [theme.fn.smallerThan('sm')]: { paddingInline: 6 },
    }),
    styles: { label: { minWidth: 0 } },
    leftIcon:
      align === 'left' ? (
        <ArrowHint arrow={arrow} icon={<IconChevronLeft size="1rem" />} showKey={showKeyHint} />
      ) : undefined,
    rightIcon:
      align === 'right' ? (
        <ArrowHint arrow={arrow} icon={<IconChevronRight size="1rem" />} showKey={showKeyHint} />
      ) : undefined,
  };

  if (!hymn || !href) {
    return (
      <Button {...buttonProps} disabled aria-label={directionLabel}>
        {label}
      </Button>
    );
  }

  return (
    <Button
      {...buttonProps}
      title={title}
      component={Link}
      href={href}
      aria-label={`${directionLabel}: ${hymnLabel}`}
      aria-keyshortcuts={shortcut}
    >
      {label}
    </Button>
  );
}

type HymnNavigationProps = {
  hymnBookSlug: string;
  previousHymn?: HymnNavigationItem | null;
  nextHymn?: HymnNavigationItem | null;
  showNumbers?: boolean;
};

export function HymnNavigation({
  hymnBookSlug,
  previousHymn,
  nextHymn,
  showNumbers = true,
}: HymnNavigationProps) {
  const isHymnNavigationEnabled = useFeatureFlagEnabled('hymn-bottom-navigation');
  const isSlideModeOpen = useIsSlideModeOpen();
  const isDesktopDevice = useIsDesktopDevice();
  const previousHref = previousHymn ? `/${hymnBookSlug}/${previousHymn.slug}` : undefined;
  const nextHref = nextHymn ? `/${hymnBookSlug}/${nextHymn.slug}` : undefined;

  usePagerNavigation({
    previousHref,
    nextHref,
    enabled: Boolean(isHymnNavigationEnabled) && !isSlideModeOpen,
  });

  if (!isHymnNavigationEnabled) {
    return null;
  }

  return (
    <Box
      component="nav"
      aria-label="Navegação entre hinos"
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, minmax(0, max-content))',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 4,
        minWidth: 0,
      }}
    >
      <NavigationButton
        align="left"
        showKeyHint={isDesktopDevice}
        directionLabel="Anterior"
        hymn={previousHymn}
        showNumbers={showNumbers}
        href={previousHref}
      />
      <NavigationButton
        align="right"
        showKeyHint={isDesktopDevice}
        directionLabel="Próximo"
        hymn={nextHymn}
        showNumbers={showNumbers}
        href={nextHref}
      />
    </Box>
  );
}
